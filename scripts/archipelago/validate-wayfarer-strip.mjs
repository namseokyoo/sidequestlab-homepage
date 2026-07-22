#!/usr/bin/env node

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import sharp from "sharp";

import {
  PATH_PREFIXES,
  PipelineError,
  REPO_ROOT,
  assertRepoPath,
  assertSafeScratchPath,
  inspectPng,
  readJson,
  repoFsPath,
  sha256File,
  writeJsonAtomic,
} from "./prepare-scene-assets.mjs";
import { detectGroundAnchors } from "./pack-wayfarer-strip.mjs";

export const STRIP_VALIDATOR_VERSION = "1.0.0";
export const STRIP_WIDTH = 2048;
export const STRIP_HEIGHT = 256;
export const CELL_SIZE = 256;
export const FRAME_COUNT = 8;

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new PipelineError("ERR_MANIFEST", `${label} must be a nonempty string`);
  }
  return value;
}

function requireSha256(value, label) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new PipelineError("ERR_MANIFEST", `${label} must be a lowercase SHA-256`);
  }
  return value;
}

async function validateFileBinding(binding, { label, pathKey = "path", png = false, prefixes } = {}) {
  if (!binding || typeof binding !== "object") {
    throw new PipelineError("ERR_MANIFEST", `${label} binding is required`);
  }
  const filePath = requireString(binding[pathKey], `${label}.${pathKey}`);
  assertRepoPath(filePath, prefixes, `${label}.${pathKey}`);
  const expected = requireSha256(binding.sha256, `${label}.sha256`);
  const actual = await sha256File(filePath);
  if (actual !== expected) {
    throw new PipelineError("ERR_PROVENANCE_HASH", `${label} hash does not match ${filePath}`, { expected, actual });
  }
  const result = { path: filePath, sha256: actual };
  if (png) {
    const inspected = await inspectPng(filePath);
    if (binding.width !== undefined && inspected.width !== Number(binding.width)) {
      throw new PipelineError("ERR_PROVENANCE_DIMENSION", `${label} width does not match ${filePath}`);
    }
    if (binding.height !== undefined && inspected.height !== Number(binding.height)) {
      throw new PipelineError("ERR_PROVENANCE_DIMENSION", `${label} height does not match ${filePath}`);
    }
    result.png = inspected;
  }
  return result;
}

function manifestPathPolicy(manifestPath) {
  try {
    assertRepoPath(manifestPath, "tmp/archipelago-recovery/self-test", "manifestPath");
    return { selfTest: true, prefix: path.dirname(manifestPath) };
  } catch (error) {
    if (!(error instanceof PipelineError) || error.code !== "ERR_UNSAFE_PATH") throw error;
  }
  assertRepoPath(manifestPath, PATH_PREFIXES.manifests, "manifestPath");
  return { selfTest: false, prefix: null };
}

function validateProvider(provider, label) {
  if (!provider || typeof provider !== "object") {
    throw new PipelineError("ERR_MANIFEST", `${label}.provider is required`);
  }
  return {
    name: requireString(provider.name, `${label}.provider.name`),
    outputId: requireString(provider.outputId, `${label}.provider.outputId`),
    model: provider.model ?? null,
    modelUnavailable: provider.modelUnavailable === true,
  };
}

function nonNegativeInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new PipelineError("ERR_MANIFEST", `${label} must be a finite non-negative integer`);
  }
  return parsed;
}

function point(value, label) {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new PipelineError("ERR_MANIFEST", `${label} must be [x,y]`);
  }
  return value.map((coordinate, axis) => nonNegativeInteger(coordinate, `${label}[${axis}]`));
}

function anchorContract(anchors) {
  if (anchors === undefined) return undefined;
  if (!anchors?.equipment?.name || !anchors?.plantedFoot?.name) {
    throw new PipelineError("ERR_MANIFEST", "Anchor contract requires named equipment and plantedFoot anchors");
  }
  return {
    equipment: { name: anchors.equipment.name, target: point(anchors.equipment.target, "equipment.target") },
    plantedFoot: { name: anchors.plantedFoot.name, target: point(anchors.plantedFoot.target, "plantedFoot.target") },
    maxDeviationPx: nonNegativeInteger(anchors.maxDeviationPx, "anchors.maxDeviationPx"),
  };
}

function visibleBounds(data, width, height, alphaThreshold = 16) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < alphaThreshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      pixels += 1;
    }
  }
  if (pixels === 0) throw new PipelineError("ERR_EMPTY_FRAME", "Strip cell contains no visible pixels");
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels };
}

export async function validateWayfarerStrip({
  filePath,
  sha256,
  targetPivot = [128, 240],
  padding = 4,
  maximumPivotDeviationPx = 2,
  anchors,
  receiptPath,
}) {
  const resolvedPadding = nonNegativeInteger(padding, "padding");
  const resolvedMaximumPivotDeviationPx = nonNegativeInteger(maximumPivotDeviationPx, "maximumPivotDeviationPx");
  const resolvedTargetPivot = point(targetPivot, "targetPivot");
  const resolvedAnchors = anchorContract(anchors);
  const inspected = await inspectPng(filePath, { requireAlpha: true });
  if (inspected.width !== STRIP_WIDTH || inspected.height !== STRIP_HEIGHT || inspected.channels !== 4) {
    throw new PipelineError("ERR_STRIP_FORMAT", `Strip must be ${STRIP_WIDTH}x${STRIP_HEIGHT} RGBA: ${filePath}`, {
      actual: [inspected.width, inspected.height, inspected.channels],
    });
  }
  if (!sha256) throw new PipelineError("ERR_MANIFEST", `Expected SHA-256 is missing for ${filePath}`);
  if (inspected.sha256 !== sha256) {
    throw new PipelineError("ERR_OUTPUT_HASH", `Strip SHA-256 does not match for ${filePath}`, {
      expected: sha256,
      actual: inspected.sha256,
    });
  }
  const { data } = await sharp(repoFsPath(filePath), { failOn: "error", limitInputPixels: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const frames = [];
  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const cell = Buffer.alloc(CELL_SIZE * STRIP_HEIGHT * 4);
    for (let y = 0; y < STRIP_HEIGHT; y += 1) {
      const sourceStart = (y * STRIP_WIDTH + index * CELL_SIZE) * 4;
      data.copy(cell, y * CELL_SIZE * 4, sourceStart, sourceStart + CELL_SIZE * 4);
    }
    const bounds = visibleBounds(cell, CELL_SIZE, STRIP_HEIGHT);
    if (
      bounds.minX < resolvedPadding || bounds.minY < resolvedPadding ||
      bounds.maxX >= CELL_SIZE - resolvedPadding || bounds.maxY >= STRIP_HEIGHT - resolvedPadding
    ) {
      throw new PipelineError("ERR_BOUND_CONTACT", `Frame ${index} violates ${resolvedPadding}px cell bounds`, { index, bounds });
    }
    const computedFootY = bounds.maxY + 1;
    const pivotDeviationPx = Math.abs(computedFootY - resolvedTargetPivot[1]);
    if (pivotDeviationPx > resolvedMaximumPivotDeviationPx) {
      throw new PipelineError("ERR_PIVOT_DRIFT", `Frame ${index} foot pivot drift exceeds ${resolvedMaximumPivotDeviationPx}px`, {
        index, computedFootY, targetPivot: resolvedTargetPivot, pivotDeviationPx,
      });
    }
    let detectedAnchors = null;
    if (resolvedAnchors) {
      const detected = detectGroundAnchors(cell, CELL_SIZE, STRIP_HEIGHT, bounds);
      const equipmentDeviation = detected.equipment.map((value, axis) => Math.abs(value - resolvedAnchors.equipment.target[axis]));
      const plantedFootDeviation = detected.plantedFoot.map((value, axis) => Math.abs(value - resolvedAnchors.plantedFoot.target[axis]));
      if ([...equipmentDeviation, ...plantedFootDeviation].some((value) => value > resolvedAnchors.maxDeviationPx)) {
        throw new PipelineError("ERR_ANCHOR_DRIFT", `Frame ${index} semantic anchor drift exceeds ${resolvedAnchors.maxDeviationPx}px`, {
          index, detected, resolvedAnchors, equipmentDeviation, plantedFootDeviation,
        });
      }
      detectedAnchors = {
        equipment: { name: resolvedAnchors.equipment.name, target: resolvedAnchors.equipment.target, actual: detected.equipment, deviation: equipmentDeviation },
        plantedFoot: { name: resolvedAnchors.plantedFoot.name, target: resolvedAnchors.plantedFoot.target, actual: detected.plantedFoot, deviation: plantedFootDeviation },
        maximumDeviationPx: resolvedAnchors.maxDeviationPx,
      };
    }
    frames.push({ index, bounds, computedFootY, targetPivot: resolvedTargetPivot, pivotDeviationPx, anchors: detectedAnchors });
  }

  if (receiptPath) {
    const receipt = await readJson(receiptPath);
    if (!receipt.prepared?.sha256 || receipt.prepared.sha256 !== inspected.sha256) {
      throw new PipelineError("ERR_RECEIPT_HASH", `Packing receipt hash does not match ${filePath}`);
    }
    if (!Array.isArray(receipt.frames) || receipt.frames.length !== FRAME_COUNT) {
      throw new PipelineError("ERR_RECEIPT_FRAMES", `Packing receipt must describe ${FRAME_COUNT} frames`);
    }
    receipt.frames.forEach((frame, index) => {
      const declaredFoot = Number(frame.computedFootY);
      const actualFoot = resolvedAnchors
        ? frames[index].anchors.plantedFoot.actual[1]
        : frames[index].computedFootY;
      if (!Number.isFinite(declaredFoot) || Math.abs(declaredFoot - actualFoot) > resolvedMaximumPivotDeviationPx) {
        throw new PipelineError("ERR_RECEIPT_PIVOT", `Packing receipt pivot differs from frame ${index}`);
      }
      if (resolvedAnchors) {
        for (const kind of ["equipment", "plantedFoot"]) {
          const declared = frame.anchors?.[kind]?.actual;
          const actual = frames[index].anchors[kind].actual;
          if (!Array.isArray(declared) || declared.length !== 2 || declared.some((value, axis) => value !== actual[axis])) {
            throw new PipelineError("ERR_RECEIPT_ANCHOR", `Packing receipt ${kind} anchor differs from frame ${index}`);
          }
        }
      }
    });
  }

  return { path: filePath, ...inspected, frameCount: FRAME_COUNT, cellSize: CELL_SIZE,
    targetPivot: resolvedTargetPivot, maximumPivotDeviationPx: resolvedMaximumPivotDeviationPx,
    anchors: resolvedAnchors ?? null, frames, receiptPath: receiptPath ?? null, status: "PASS" };
}

async function writeContactSheet(results, evidenceDir, {
  frameSize = 96,
  fileName = "wayfarer-contact-sheet-96px.png",
} = {}) {
  const backgrounds = [
    { id: "water-light", color: { r: 151, g: 216, b: 225 } },
    { id: "water-dark", color: { r: 27, g: 72, b: 91 } },
    { id: "foliage", color: { r: 48, g: 83, b: 57 } },
    { id: "paper", color: { r: 245, g: 235, b: 216 } },
  ];
  const width = FRAME_COUNT * frameSize;
  const height = results.length * backgrounds.length * frameSize;
  const base = Buffer.alloc(width * height * 3);
  for (let stripIndex = 0; stripIndex < results.length; stripIndex += 1) {
    for (let backgroundIndex = 0; backgroundIndex < backgrounds.length; backgroundIndex += 1) {
      const color = backgrounds[backgroundIndex].color;
      const top = (stripIndex * backgrounds.length + backgroundIndex) * frameSize;
      for (let y = top; y < top + frameSize; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const offset = (y * width + x) * 3;
          base[offset] = color.r;
          base[offset + 1] = color.g;
          base[offset + 2] = color.b;
        }
      }
    }
  }
  const composites = [];
  for (let stripIndex = 0; stripIndex < results.length; stripIndex += 1) {
    for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
      const frame = await sharp(repoFsPath(results[stripIndex].path))
        .extract({ left: frameIndex * CELL_SIZE, top: 0, width: CELL_SIZE, height: CELL_SIZE })
        .resize(frameSize, frameSize, { kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer();
      for (let backgroundIndex = 0; backgroundIndex < backgrounds.length; backgroundIndex += 1) {
        composites.push({
          input: frame,
          left: frameIndex * frameSize,
          top: (stripIndex * backgrounds.length + backgroundIndex) * frameSize,
        });
      }
    }
  }
  const outputPath = path.join(evidenceDir, fileName);
  await sharp(base, { raw: { width, height, channels: 3 } })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(repoFsPath(outputPath));
  const sha256 = await sha256File(outputPath);
  return { path: outputPath, sha256, width, height, frameSize, backgrounds: backgrounds.map(({ id }) => id) };
}

export async function validateWayfarerManifest({ manifestPath, evidenceDir, allowPending = false }) {
  const pathPolicy = manifestPathPolicy(manifestPath);
  const manifest = await readJson(manifestPath);
  if (!Array.isArray(manifest.strips) || manifest.strips.length === 0) {
    throw new PipelineError("ERR_MANIFEST", "strip manifest strips must be a nonempty array");
  }
  const approvedReference = await validateFileBinding(manifest.approvedReference, {
    label: "approvedReference",
    png: true,
    prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.references,
  });
  if (evidenceDir) {
    assertRepoPath(
      evidenceDir,
      pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.validationEvidence,
      "evidenceDir",
    );
  }
  const results = [];
  for (const strip of manifest.strips) {
    if (!strip?.id || !strip.output?.path) throw new PipelineError("ERR_MANIFEST", "Each strip needs id and output.path");
    if (!strip.processing?.anchors) {
      throw new PipelineError("ERR_MANIFEST", `Strip ${strip.id} is missing the semantic anchor contract`);
    }
    const prompt = await validateFileBinding(strip.prompt, {
      label: `${strip.id}.prompt`,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.prompts,
    });
    const provider = validateProvider(strip.provider, strip.id);
    const pending = !strip.output.sha256 || ["pending", "not-generated"].includes(strip.output.status);
    if (pending) {
      if (!allowPending) throw new PipelineError("ERR_ASSET_PENDING", `Wayfarer strip is pending: ${strip.id}`);
      results.push({ id: strip.id, path: strip.output.path, prompt, provider, status: "PENDING" });
      continue;
    }
    const source = await validateFileBinding(strip.source, {
      label: `${strip.id}.source`,
      pathKey: "rawPath",
      png: true,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.sceneSources,
    });
    if (strip.source.grid?.columns !== 4 || strip.source.grid?.rows !== 2) {
      throw new PipelineError("ERR_MANIFEST", `${strip.id}.source.grid must be 4x2`);
    }
    const identityReference = await validateFileBinding(strip.visualContract?.identityReference, {
      label: `${strip.id}.visualContract.identityReference`,
      png: true,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.stripOutputs,
    });
    const reportPath = requireString(strip.processing.reportPath, `${strip.id}.processing.reportPath`);
    assertRepoPath(
      strip.output.path,
      pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.stripOutputs,
      `${strip.id}.output.path`,
    );
    assertRepoPath(
      reportPath,
      pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.stripReports,
      `${strip.id}.processing.reportPath`,
    );
    const reportSha256 = requireSha256(strip.processing.reportSha256, `${strip.id}.processing.reportSha256`);
    const reportBinding = await validateFileBinding({ path: reportPath, sha256: reportSha256 }, {
      label: `${strip.id}.processing.report`,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.stripReports,
    });
    const packReceipt = await readJson(reportPath);
    if (
      packReceipt.input !== strip.source.rawPath || packReceipt.source?.sha256 !== strip.source.sha256 ||
      packReceipt.output !== strip.output.path || packReceipt.prepared?.sha256 !== strip.output.sha256
    ) {
      throw new PipelineError("ERR_RECEIPT_BINDING", `${strip.id} pack receipt does not bind source and output`);
    }
    results.push({ id: strip.id, prompt, provider, source, identityReference, report: reportBinding, ...(await validateWayfarerStrip({
      filePath: strip.output.path,
      sha256: strip.output.sha256,
      targetPivot: strip.processing?.targetPivot ?? [128, 240],
      padding: strip.processing?.validationPadding ?? 4,
      maximumPivotDeviationPx: strip.processing?.maximumPivotDeviationPx ?? 2,
      anchors: strip.processing?.anchors,
      receiptPath: strip.processing?.reportPath,
    })) });
  }
  const receipt = {
    schemaVersion: 1,
    validator: `validate-wayfarer-strip@${STRIP_VALIDATOR_VERSION}`,
    manifestPath,
    approvedReference,
    status: results.some((result) => result.status === "PENDING") ? "PARTIAL" : "PASS",
    results,
  };
  if (evidenceDir) {
    await mkdir(repoFsPath(evidenceDir), { recursive: true });
    const readyResults = results.filter((result) => result.status === "PASS");
    receipt.contactSheet = readyResults.length > 0 ? await writeContactSheet(readyResults, evidenceDir) : null;
    receipt.fullContactSheet = readyResults.length > 0
      ? await writeContactSheet(readyResults, evidenceDir, {
          frameSize: CELL_SIZE,
          fileName: "wayfarer-contact-sheet-full.png",
        })
      : null;
    await writeJsonAtomic(path.join(evidenceDir, "wayfarer-validation.json"), receipt);
  }
  return receipt;
}

async function expectFailure(code, operation) {
  try {
    await operation();
  } catch (error) {
    if (error instanceof PipelineError && error.code === code) return true;
    throw error;
  }
  throw new PipelineError("ERR_SELF_TEST", `Expected ${code}`);
}

function requirePassStatus(result) {
  if (result.status !== "PASS") {
    throw new PipelineError("ERR_VALIDATION_STATUS", `Validation completed with status ${result.status}`);
  }
  return result;
}

async function writeSyntheticStrip(filePath, { width = STRIP_WIDTH, channels = 4, footY = 240, touch = false } = {}) {
  const data = Buffer.alloc(width * STRIP_HEIGHT * channels);
  for (let index = 0; index < Math.floor(width / CELL_SIZE); index += 1) {
    const left = index * CELL_SIZE + (touch && index === 0 ? 0 : 96);
    const right = index * CELL_SIZE + 159;
    for (let y = 64; y < footY; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const offset = (y * width + x) * channels;
        data[offset] = 210;
        data[offset + 1] = 95;
        data[offset + 2] = 50;
        if (channels === 4) data[offset + 3] = 255;
      }
    }
  }
  await sharp(data, { raw: { width, height: STRIP_HEIGHT, channels } }).png().toFile(repoFsPath(filePath));
}

async function runSelfTest(scratch) {
  const scratchFs = assertSafeScratchPath(scratch);
  scratch = path.relative(REPO_ROOT, scratchFs);
  await rm(scratchFs, { recursive: true, force: true });
  await mkdir(scratchFs, { recursive: true });
  const validPath = path.join(scratch, "valid.png");
  await writeSyntheticStrip(validPath);
  const valid = await inspectPng(validPath, { requireAlpha: true });
  const passed = await validateWayfarerStrip({ filePath: validPath, sha256: valid.sha256 });
  if (passed.frames.length !== FRAME_COUNT) throw new PipelineError("ERR_SELF_TEST", "Eight cells were not validated");

  const wrongWidth = path.join(scratch, "wrong-width.png");
  await writeSyntheticStrip(wrongWidth, { width: 1792 });
  const wrongWidthInfo = await inspectPng(wrongWidth, { requireAlpha: true });
  const wrongWidthRejected = await expectFailure("ERR_STRIP_FORMAT", () => validateWayfarerStrip({
    filePath: wrongWidth, sha256: wrongWidthInfo.sha256,
  }));
  const missingAlpha = path.join(scratch, "missing-alpha.png");
  await writeSyntheticStrip(missingAlpha, { channels: 3 });
  const missingAlphaInfo = await inspectPng(missingAlpha);
  const missingAlphaRejected = await expectFailure("ERR_ALPHA_REQUIRED", () => validateWayfarerStrip({
    filePath: missingAlpha, sha256: missingAlphaInfo.sha256,
  }));
  const touching = path.join(scratch, "touching.png");
  await writeSyntheticStrip(touching, { touch: true });
  const touchingInfo = await inspectPng(touching, { requireAlpha: true });
  const boundContactRejected = await expectFailure("ERR_BOUND_CONTACT", () => validateWayfarerStrip({
    filePath: touching, sha256: touchingInfo.sha256,
  }));
  const drifted = path.join(scratch, "drifted.png");
  await writeSyntheticStrip(drifted, { footY: 237 });
  const driftedInfo = await inspectPng(drifted, { requireAlpha: true });
  const pivotDriftRejected = await expectFailure("ERR_PIVOT_DRIFT", () => validateWayfarerStrip({
    filePath: drifted, sha256: driftedInfo.sha256,
  }));
  const malformed = path.join(scratch, "malformed.png");
  await writeFile(repoFsPath(malformed), "not a png");
  const malformedRejected = await expectFailure("ERR_NOT_PNG", () => validateWayfarerStrip({
    filePath: malformed, sha256: "0".repeat(64),
  }));
  const invalidNumericRejected = await expectFailure("ERR_MANIFEST", () => validateWayfarerStrip({
    filePath: validPath, sha256: valid.sha256, padding: "NaN",
  }));
  const missingReceiptHashPath = path.join(scratch, "missing-receipt-hash.json");
  await writeJsonAtomic(missingReceiptHashPath, { frames: Array.from({ length: FRAME_COUNT }, () => ({ computedFootY: 240 })) });
  const missingReceiptHashRejected = await expectFailure("ERR_RECEIPT_HASH", () => validateWayfarerStrip({
    filePath: validPath, sha256: valid.sha256, receiptPath: missingReceiptHashPath,
  }));
  const emptyManifestPath = path.join(scratch, "empty-manifest.json");
  await writeJsonAtomic(emptyManifestPath, { strips: [] });
  const emptyManifestRejected = await expectFailure("ERR_MANIFEST", () => validateWayfarerManifest({
    manifestPath: emptyManifestPath,
  }));
  const promptPath = path.join(scratch, "prompt.md");
  await writeFile(repoFsPath(promptPath), "locked prompt\n");
  const promptSha256 = await sha256File(promptPath);
  const missingReceiptPath = path.join(scratch, "missing-receipt-manifest.json");
  await writeJsonAtomic(missingReceiptPath, {
    approvedReference: { path: validPath, sha256: valid.sha256 },
    strips: [{
      id: "missing-receipt",
      prompt: { path: promptPath, sha256: promptSha256 },
      provider: { name: "self-test", outputId: "self-test-output" },
      source: { rawPath: validPath, sha256: valid.sha256, width: STRIP_WIDTH, height: STRIP_HEIGHT,
        grid: { columns: 4, rows: 2 } },
      output: { path: validPath, sha256: valid.sha256 },
      processing: { anchors: { equipment: { name: "equipment", target: [128, 240] },
        plantedFoot: { name: "foot", target: [128, 240] }, maxDeviationPx: 2 } },
      visualContract: { identityReference: { path: validPath, sha256: valid.sha256 } },
    }],
  });
  const missingReceiptBindingRejected = await expectFailure("ERR_MANIFEST", () => validateWayfarerManifest({
    manifestPath: missingReceiptPath,
  }));
  const unsafePathManifest = path.join(scratch, "unsafe-path-manifest.json");
  await writeJsonAtomic(unsafePathManifest, {
    approvedReference: { path: validPath, sha256: valid.sha256 },
    strips: [{
      id: "unsafe",
      prompt: { path: promptPath, sha256: promptSha256 },
      provider: { name: "self-test", outputId: "self-test-output" },
      source: { rawPath: validPath, sha256: valid.sha256, width: STRIP_WIDTH, height: STRIP_HEIGHT,
        grid: { columns: 4, rows: 2 } },
      output: { path: "../outside.png", sha256: valid.sha256 },
      processing: { reportPath: path.join(scratch, "receipt.json"), reportSha256: "0".repeat(64),
        anchors: { equipment: { name: "equipment", target: [128, 240] },
          plantedFoot: { name: "foot", target: [128, 240] }, maxDeviationPx: 2 } },
      visualContract: { identityReference: { path: validPath, sha256: valid.sha256 } },
    }],
  });
  const unsafePathRejected = await expectFailure("ERR_UNSAFE_PATH", () => validateWayfarerManifest({
    manifestPath: unsafePathManifest,
  }));
  const partialStatusRejected = await expectFailure("ERR_VALIDATION_STATUS", () => requirePassStatus({ status: "PARTIAL" }));

  return { status: "PASS", script: "validate-wayfarer-strip", checks: {
    exactFormat: [STRIP_WIDTH, STRIP_HEIGHT, "RGBA"], frameCount: FRAME_COUNT,
    alphaBounds: true, targetPivot: [128, 240], wrongWidthRejected, missingAlphaRejected,
    boundContactRejected, pivotDriftRejected, malformedRejected, invalidNumericRejected,
    missingReceiptHashRejected, missingReceiptBindingRejected, unsafePathRejected, partialStatusRejected,
    emptyManifestRejected,
  } };
}

function presentOptions(values) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== false && (!Array.isArray(value) || value.length > 0))
    .map(([key]) => key);
}

function assertOnlyOptions(values, allowed, mode) {
  const unexpected = presentOptions(values).filter((key) => !allowed.has(key));
  if (unexpected.length > 0) {
    throw new PipelineError("ERR_ARGUMENT", `${mode} mode does not accept: ${unexpected.join(", ")}`);
  }
}

function parseCli(argv) {
  return parseArgs({ args: argv, strict: true, allowPositionals: false, options: {
    "self-test": { type: "boolean" }, scratch: { type: "string" }, manifest: { type: "string" },
    evidence: { type: "string" }, "allow-pending": { type: "boolean" },
  } }).values;
}

async function main(argv) {
  const values = parseCli(argv);
  const modes = [values["self-test"], values.manifest].filter(Boolean).length;
  if (modes !== 1) throw new PipelineError("ERR_ARGUMENT", "Choose exactly one of --self-test or --manifest");
  if (values["self-test"]) assertOnlyOptions(values, new Set(["self-test", "scratch"]), "self-test");
  if (values.manifest) {
    assertOnlyOptions(values, new Set(["manifest", "evidence", "allow-pending"]), "manifest");
  }
  const result = values["self-test"]
    ? await runSelfTest(values.scratch ?? "tmp/archipelago-recovery/self-test/strip-validation")
    : await validateWayfarerManifest({
        manifestPath: values.manifest,
        evidenceDir: values.evidence,
        allowPending: Boolean(values["allow-pending"]),
      });
  console.log(JSON.stringify(result, null, 2));
  requirePassStatus(result);
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    const usageError = error?.code?.startsWith?.("ERR_PARSE_ARGS") || error?.code === "ERR_ARGUMENT";
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = usageError ? 2 : 1;
  });
}
