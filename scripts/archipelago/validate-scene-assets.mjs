#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

export const SCENE_VALIDATOR_VERSION = "1.0.0";

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
  };
}

async function rejectTextChunks(filePath) {
  const bytes = await readFile(repoFsPath(filePath));
  let offset = 8;
  const found = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (offset + 12 + length > bytes.length) {
      throw new PipelineError("ERR_PNG_CHUNK", `Truncated PNG chunk in ${filePath}`);
    }
    if (["tEXt", "zTXt", "iTXt"].includes(type)) found.push(type);
    offset += 12 + length;
    if (type === "IEND") break;
  }
  if (found.length > 0) {
    throw new PipelineError("ERR_TEXT_METADATA", `PNG contains text metadata: ${filePath}`, { chunks: found });
  }
}

export async function validateSceneFile({ filePath, width, height, sha256 }) {
  const inspected = await probePng(filePath);
  const expectedWidth = Number(width);
  const expectedHeight = Number(height);
  if (!Number.isInteger(expectedWidth) || expectedWidth <= 0 || !Number.isInteger(expectedHeight) || expectedHeight <= 0) {
    throw new PipelineError("ERR_MANIFEST", `Expected dimensions are missing for ${filePath}`);
  }
  if (inspected.width !== expectedWidth || inspected.height !== expectedHeight) {
    throw new PipelineError("ERR_OUTPUT_DIMENSION", `Scene dimensions do not match for ${filePath}`, {
      expected: [expectedWidth, expectedHeight],
      actual: [inspected.width, inspected.height],
    });
  }
  if (!sha256) throw new PipelineError("ERR_MANIFEST", `Expected SHA-256 is missing for ${filePath}`);
  if (inspected.sha256 !== sha256) {
    throw new PipelineError("ERR_OUTPUT_HASH", `Scene SHA-256 does not match for ${filePath}`, {
      expected: sha256,
      actual: inspected.sha256,
    });
  }
  await rejectTextChunks(filePath);
  return { path: filePath, ...inspected, textMetadata: false, status: "PASS" };
}

export async function probePng(filePath) {
  const inspected = await inspectPng(filePath);
  await sharp(repoFsPath(filePath), { failOn: "error", limitInputPixels: true }).raw().toBuffer();
  return { path: filePath, ...inspected, fullDecode: true, status: "PASS" };
}

async function writeSceneContactSheet(results, evidenceDir, { monochrome = false } = {}) {
  const columns = 2;
  const tileWidth = 640;
  const tileHeight = 400;
  const rows = Math.ceil(results.length / columns);
  const width = columns * tileWidth;
  const height = rows * tileHeight;
  const composites = [];
  const tiles = [];
  for (const [index, result] of results.entries()) {
    const left = (index % columns) * tileWidth;
    const top = Math.floor(index / columns) * tileHeight;
    let framePipeline = sharp(repoFsPath(result.path), { failOn: "error", limitInputPixels: true })
      .resize(tileWidth - 24, tileHeight - 24, {
        fit: "contain",
        position: "centre",
        kernel: sharp.kernel.lanczos3,
        background: { r: 228, g: 238, b: 232 },
      });
    if (monochrome) framePipeline = framePipeline.grayscale();
    const frame = await framePipeline
      .png({ compressionLevel: 9, adaptiveFiltering: false })
      .toBuffer();
    composites.push({ input: frame, left: left + 12, top: top + 12 });
    tiles.push({ id: result.id, path: result.path, left, top, width: tileWidth, height: tileHeight });
  }
  const outputPath = path.join(
    evidenceDir,
    monochrome ? "scene-contact-sheet-monochrome.png" : "scene-contact-sheet.png",
  );
  await sharp({
    create: { width, height, channels: 3, background: { r: 37, g: 63, b: 64 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(repoFsPath(outputPath));
  const sha256 = await sha256File(outputPath);
  return { path: outputPath, sha256, width, height, columns, rows, monochrome, tiles };
}

export async function validateSceneManifest({ manifestPath, evidenceDir, allowPending = false }) {
  const pathPolicy = manifestPathPolicy(manifestPath);
  const manifest = await readJson(manifestPath);
  if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) {
    throw new PipelineError("ERR_MANIFEST", "scene manifest assets must be a nonempty array");
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
  for (const asset of manifest.assets) {
    if (!asset?.id || !asset.output?.path) throw new PipelineError("ERR_MANIFEST", "Each scene asset needs id and output.path");
    const prompt = await validateFileBinding(asset.prompt, {
      label: `${asset.id}.prompt`,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.prompts,
    });
    const provider = validateProvider(asset.provider, asset.id);
    const pending = !asset.output.sha256 || ["pending", "not-generated"].includes(asset.output.status);
    if (pending) {
      if (!allowPending) throw new PipelineError("ERR_ASSET_PENDING", `Scene asset is pending: ${asset.id}`);
      results.push({ id: asset.id, path: asset.output.path, prompt, provider, status: "PENDING" });
      continue;
    }
    const source = await validateFileBinding(asset.source, {
      label: `${asset.id}.source`,
      pathKey: "rawPath",
      png: true,
      prefixes: pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.sceneSources,
    });
    if (
      asset.visualContract?.people !== 0 || asset.visualContract?.embeddedText !== false ||
      asset.visualContract?.logos !== false || asset.visualContract?.semanticUi !== false
    ) {
      throw new PipelineError("ERR_MANIFEST", `${asset.id}.visualContract must lock people=0 and prohibit embedded text, logos, and semantic UI`);
    }
    assertRepoPath(
      asset.output.path,
      pathPolicy.selfTest ? pathPolicy.prefix : PATH_PREFIXES.sceneOutputs,
      `${asset.id}.output.path`,
    );
    results.push({ id: asset.id, prompt, provider, source, ...(await validateSceneFile({
      filePath: asset.output.path,
      width: asset.output.width,
      height: asset.output.height,
      sha256: asset.output.sha256,
    })) });
  }
  const receipt = {
    schemaVersion: 1,
    validator: `validate-scene-assets@${SCENE_VALIDATOR_VERSION}`,
    manifestPath,
    approvedReference,
    status: results.some((result) => result.status === "PENDING") ? "PARTIAL" : "PASS",
    results,
  };
  if (evidenceDir) {
    await mkdir(repoFsPath(evidenceDir), { recursive: true });
    const readyResults = results.filter((result) => result.status === "PASS");
    receipt.contactSheet = readyResults.length > 0 ? await writeSceneContactSheet(readyResults, evidenceDir) : null;
    receipt.monochromeContactSheet = readyResults.length > 0
      ? await writeSceneContactSheet(readyResults, evidenceDir, { monochrome: true })
      : null;
    await writeJsonAtomic(path.join(evidenceDir, "scene-validation.json"), receipt);
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

async function runSelfTest(scratch) {
  const scratchFs = assertSafeScratchPath(scratch);
  scratch = path.relative(REPO_ROOT, scratchFs);
  await rm(scratchFs, { recursive: true, force: true });
  await mkdir(scratchFs, { recursive: true });
  const validPath = path.join(scratch, "valid.png");
  await sharp({ create: { width: 12, height: 7, channels: 3, background: { r: 42, g: 91, b: 137 } } })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(repoFsPath(validPath));
  const inspected = await inspectPng(validPath);
  const promptPath = path.join(scratch, "prompt.md");
  await writeFile(repoFsPath(promptPath), "locked prompt\n");
  const promptSha256 = await sha256File(promptPath);
  const manifestPath = path.join(scratch, "manifest.json");
  await writeJsonAtomic(manifestPath, {
    approvedReference: { path: validPath, sha256: inspected.sha256 },
    assets: [{
      id: "valid",
      prompt: { path: promptPath, sha256: promptSha256 },
      provider: { name: "self-test", outputId: "self-test-output" },
      source: { rawPath: validPath, width: 12, height: 7, sha256: inspected.sha256 },
      output: { path: validPath, width: 12, height: 7, sha256: inspected.sha256 },
      visualContract: { people: 0, embeddedText: false, logos: false, semanticUi: false },
    }],
  });
  const pass = await validateSceneManifest({ manifestPath, evidenceDir: path.join(scratch, "evidence") });
  if (pass.status !== "PASS") throw new PipelineError("ERR_SELF_TEST", "Valid manifest did not pass");

  const wrongDimensionRejected = await expectFailure("ERR_OUTPUT_DIMENSION", () => validateSceneFile({
    filePath: validPath, width: 13, height: 7, sha256: inspected.sha256,
  }));
  const wrongHashRejected = await expectFailure("ERR_OUTPUT_HASH", () => validateSceneFile({
    filePath: validPath, width: 12, height: 7, sha256: "0".repeat(64),
  }));
  const malformedPath = path.join(scratch, "malformed.png");
  await writeFile(repoFsPath(malformedPath), "not a png");
  const malformedRejected = await expectFailure("ERR_NOT_PNG", () => probePng(malformedPath));
  const missingIendPath = path.join(scratch, "missing-iend.png");
  const validBytes = await readFile(repoFsPath(validPath));
  await writeFile(repoFsPath(missingIendPath), validBytes.subarray(0, validBytes.length - 12));
  const missingIendRejected = await expectFailure("ERR_PNG_STRUCTURE", () => probePng(missingIendPath));
  const trailingPath = path.join(scratch, "trailing.png");
  await writeFile(repoFsPath(trailingPath), Buffer.concat([validBytes, Buffer.from("trailing")]));
  const trailingDataRejected = await expectFailure("ERR_PNG_TRAILING_DATA", () => probePng(trailingPath));
  const missingProvenancePath = path.join(scratch, "missing-provenance.json");
  await writeJsonAtomic(missingProvenancePath, {
    approvedReference: { path: validPath, sha256: inspected.sha256 },
    assets: [{ id: "invalid", output: { path: validPath, width: 12, height: 7, sha256: inspected.sha256 } }],
  });
  const missingProvenanceRejected = await expectFailure("ERR_MANIFEST", () => validateSceneManifest({
    manifestPath: missingProvenancePath,
  }));
  const unsafeManifestPath = path.join(scratch, "unsafe-path-manifest.json");
  await writeJsonAtomic(unsafeManifestPath, {
    approvedReference: { path: validPath, sha256: inspected.sha256 },
    assets: [{
      id: "unsafe",
      prompt: { path: promptPath, sha256: promptSha256 },
      provider: { name: "self-test", outputId: "self-test-output" },
      source: { rawPath: validPath, sha256: inspected.sha256, width: 12, height: 7 },
      output: { path: "../outside.png", width: 12, height: 7, sha256: inspected.sha256 },
      visualContract: { people: 0, embeddedText: false, logos: false, semanticUi: false },
    }],
  });
  const unsafePathRejected = await expectFailure("ERR_UNSAFE_PATH", () => validateSceneManifest({
    manifestPath: unsafeManifestPath,
  }));
  const partialStatusRejected = await expectFailure("ERR_VALIDATION_STATUS", () => requirePassStatus({ status: "PARTIAL" }));
  const emptyManifestPath = path.join(scratch, "empty-manifest.json");
  await writeJsonAtomic(emptyManifestPath, { assets: [] });
  const emptyManifestRejected = await expectFailure("ERR_MANIFEST", () => validateSceneManifest({
    manifestPath: emptyManifestPath,
  }));
  const probe = await probePng(validPath);

  return {
    status: "PASS",
    script: "validate-scene-assets",
    checks: { manifestPass: true, exactDimensions: true, sha256: true, noTextMetadata: true,
      fullDecodeProbe: probe.fullDecode, wrongDimensionRejected, wrongHashRejected, malformedRejected,
      missingIendRejected, trailingDataRejected, missingProvenanceRejected, unsafePathRejected,
      partialStatusRejected, emptyManifestRejected },
  };
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
  return parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      "self-test": { type: "boolean" },
      scratch: { type: "string" },
      probe: { type: "string" },
      manifest: { type: "string" },
      evidence: { type: "string" },
      "allow-pending": { type: "boolean" },
    },
  }).values;
}

async function main(argv) {
  const values = parseCli(argv);
  const modes = [values["self-test"], values.probe, values.manifest].filter(Boolean).length;
  if (modes !== 1) throw new PipelineError("ERR_ARGUMENT", "Choose exactly one of --self-test, --probe, or --manifest");
  if (values["self-test"]) assertOnlyOptions(values, new Set(["self-test", "scratch"]), "self-test");
  if (values.probe) assertOnlyOptions(values, new Set(["probe"]), "probe");
  if (values.manifest) {
    assertOnlyOptions(values, new Set(["manifest", "evidence", "allow-pending"]), "manifest");
  }
  if (values.probe) {
    assertRepoPath(values.probe, [PATH_PREFIXES.scratch, PATH_PREFIXES.sceneOutputs, PATH_PREFIXES.stripOutputs], "probe");
  }
  const result = values["self-test"]
    ? await runSelfTest(values.scratch ?? "tmp/archipelago-recovery/self-test/scene-validation")
    : values.probe
      ? await probePng(values.probe)
      : await validateSceneManifest({
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
