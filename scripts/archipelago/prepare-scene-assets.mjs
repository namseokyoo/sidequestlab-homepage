#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstatSync } from "node:fs";
import { mkdir, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import sharp from "sharp";

export const SCENE_PIPELINE_VERSION = "1.0.0";
export const SHARP_VERSION = sharp.versions.sharp;
export const VIPS_VERSION = sharp.versions.vips;
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const PATH_PREFIXES = Object.freeze({
  manifests: "docs/references/archipelago",
  prompts: "docs/references/archipelago/prompts",
  references: "docs/references/archipelago",
  sceneSources: "tmp/archipelago-recovery/raw",
  sceneOutputs: "public/images/archipelago",
  stripOutputs: "public/images/wayfarers",
  stripReports: "tmp/archipelago-recovery/processing",
  validationEvidence: "tmp/archipelago-recovery/validation",
  scratch: "tmp/archipelago-recovery",
});

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ALLOWED_FITS = new Set(["cover", "contain", "fill"]);
const ALLOWED_POSITIONS = new Set([
  "centre",
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
]);

const CRC32_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

export class PipelineError extends Error {
  constructor(code, message, details = undefined) {
    super(`${code}: ${message}`);
    this.name = "PipelineError";
    this.code = code;
    this.details = details;
  }
}

export function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function sha256File(filePath) {
  return sha256Buffer(await readFile(repoFsPath(filePath)));
}

export async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(repoFsPath(filePath), "utf8"));
  } catch (error) {
    throw new PipelineError("ERR_MANIFEST", `Cannot parse JSON ${filePath}`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function writeFileAtomic(filePath, contents) {
  filePath = repoFsPath(filePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  try {
    await writeFile(temporary, contents);
    await rename(temporary, filePath);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function writeJsonAtomic(filePath, value) {
  await writeFileAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function repoFsPath(filePath) {
  if (typeof filePath !== "string" || filePath.length === 0 || filePath.includes("\0")) {
    throw new PipelineError("ERR_UNSAFE_PATH", "Filesystem path must be a nonempty string");
  }
  const resolved = path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(REPO_ROOT, filePath);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PipelineError("ERR_UNSAFE_PATH", `Filesystem path escapes the repository root: ${filePath}`);
  }
  return resolved;
}

export function assertRepoPath(filePath, prefixes, label = "path") {
  if (typeof filePath !== "string" || filePath.length === 0 || path.isAbsolute(filePath) || filePath.includes("\0")) {
    throw new PipelineError("ERR_UNSAFE_PATH", `${label} must be a nonempty repository-relative path`);
  }
  const resolved = repoFsPath(filePath);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PipelineError("ERR_UNSAFE_PATH", `${label} escapes the repository root: ${filePath}`);
  }
  const allowed = (Array.isArray(prefixes) ? prefixes : [prefixes]).some((prefix) => {
    const root = path.resolve(REPO_ROOT, prefix);
    const nested = path.relative(root, resolved);
    return nested === "" || (!nested.startsWith("..") && !path.isAbsolute(nested));
  });
  if (!allowed) {
    throw new PipelineError("ERR_UNSAFE_PATH", `${label} is outside its allowed prefix: ${filePath}`);
  }
  let current = REPO_ROOT;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    try {
      if (lstatSync(current).isSymbolicLink()) {
        throw new PipelineError("ERR_UNSAFE_PATH", `${label} traverses a symbolic link: ${filePath}`);
      }
    } catch (error) {
      if (error instanceof PipelineError) throw error;
      if (error?.code === "ENOENT") break;
      throw error;
    }
  }
  return resolved;
}

export function assertSafeScratchPath(scratch, label = "scratch") {
  const resolved = assertRepoPath(scratch, PATH_PREFIXES.scratch, label);
  if (resolved === path.resolve(REPO_ROOT, PATH_PREFIXES.scratch)) {
    throw new PipelineError("ERR_UNSAFE_PATH", `${label} must be a child of ${PATH_PREFIXES.scratch}`);
  }
  return resolved;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function inspectPngStructure(bytes, input = "<buffer>") {
  if (bytes.length < PNG_SIGNATURE.length || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new PipelineError("ERR_NOT_PNG", `Input is not a PNG: ${input}`);
  }

  let offset = PNG_SIGNATURE.length;
  let ihdr = null;
  let sawIdat = false;
  let sawIend = false;
  const chunks = [];
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new PipelineError("ERR_PNG_CHUNK", `Truncated PNG chunk header: ${input}`);
    }
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (!/^[A-Za-z]{4}$/.test(type) || chunkEnd > bytes.length) {
      throw new PipelineError("ERR_PNG_CHUNK", `Malformed or truncated PNG chunk: ${input}`);
    }
    const expectedCrc = bytes.readUInt32BE(dataEnd);
    const actualCrc = crc32(bytes.subarray(offset + 4, dataEnd));
    if (actualCrc !== expectedCrc) {
      throw new PipelineError("ERR_PNG_CRC", `PNG chunk CRC mismatch for ${type}: ${input}`);
    }
    if (chunks.length === 0 && type !== "IHDR") {
      throw new PipelineError("ERR_PNG_STRUCTURE", `PNG must begin with IHDR: ${input}`);
    }
    if (type === "IHDR") {
      if (ihdr || length !== 13) {
        throw new PipelineError("ERR_PNG_STRUCTURE", `PNG must contain one 13-byte IHDR: ${input}`);
      }
      ihdr = {
        width: bytes.readUInt32BE(dataStart),
        height: bytes.readUInt32BE(dataStart + 4),
        bitDepth: bytes[dataStart + 8],
        colorType: bytes[dataStart + 9],
        compression: bytes[dataStart + 10],
        filter: bytes[dataStart + 11],
        interlace: bytes[dataStart + 12],
      };
      if (
        ihdr.width === 0 || ihdr.height === 0 || ihdr.bitDepth !== 8 ||
        ![0, 2, 4, 6].includes(ihdr.colorType) || ihdr.compression !== 0 ||
        ihdr.filter !== 0 || ihdr.interlace !== 0
      ) {
        throw new PipelineError("ERR_PNG_UNSUPPORTED", `Unsupported PNG encoding: ${input}`, ihdr);
      }
    } else if (!ihdr) {
      throw new PipelineError("ERR_PNG_STRUCTURE", `PNG chunk precedes IHDR: ${input}`);
    }
    if (["acTL", "fcTL", "fdAT"].includes(type)) {
      throw new PipelineError("ERR_APNG_UNSUPPORTED", `Animated PNG is unsupported: ${input}`);
    }
    if (type === "IDAT") sawIdat = true;
    if (type === "IEND") {
      if (sawIend || length !== 0 || !sawIdat) {
        throw new PipelineError("ERR_PNG_STRUCTURE", `Invalid IEND or missing IDAT: ${input}`);
      }
      sawIend = true;
      if (chunkEnd !== bytes.length) {
        throw new PipelineError("ERR_PNG_TRAILING_DATA", `PNG has data after IEND: ${input}`);
      }
    } else if (sawIend) {
      throw new PipelineError("ERR_PNG_TRAILING_DATA", `PNG has chunks after IEND: ${input}`);
    }
    chunks.push({ type, length });
    offset = chunkEnd;
  }
  if (!ihdr || !sawIdat || !sawIend || offset !== bytes.length) {
    throw new PipelineError("ERR_PNG_STRUCTURE", `PNG is missing required terminal structure: ${input}`);
  }
  return { ...ihdr, chunks };
}

export async function inspectPng(input, { requireAlpha = false } = {}) {
  const bytes = await readFile(repoFsPath(input));
  const structure = inspectPngStructure(bytes, input);

  let metadata;
  try {
    metadata = await sharp(bytes, { failOn: "error", limitInputPixels: true }).metadata();
  } catch (error) {
    throw new PipelineError("ERR_PNG_DECODE", `PNG decode failed: ${input}`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }

  if (metadata.format !== "png" || !metadata.width || !metadata.height) {
    throw new PipelineError("ERR_PNG_METADATA", `PNG metadata is incomplete: ${input}`);
  }
  if ((metadata.pages ?? 1) !== 1) {
    throw new PipelineError("ERR_APNG_UNSUPPORTED", `Animated or multi-page PNG is unsupported: ${input}`);
  }
  if (requireAlpha && !metadata.hasAlpha) {
    throw new PipelineError("ERR_ALPHA_REQUIRED", `PNG must contain alpha: ${input}`);
  }

  return {
    width: metadata.width,
    height: metadata.height,
    channels: metadata.channels,
    hasAlpha: Boolean(metadata.hasAlpha),
    space: metadata.space,
    bytes: bytes.length,
    sha256: sha256Buffer(bytes),
    png: {
      bitDepth: structure.bitDepth,
      colorType: structure.colorType,
      interlace: structure.interlace,
      chunkCount: structure.chunks.length,
      terminalIend: true,
    },
  };
}

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PipelineError("ERR_DIMENSION", `${label} must be a positive integer`);
  }
  return parsed;
}

function normalizeFit(fit = "cover") {
  if (!ALLOWED_FITS.has(fit)) {
    throw new PipelineError("ERR_FIT", `Unsupported fit ${fit}`);
  }
  return fit;
}

function normalizePosition(position = "centre") {
  const normalized = position === "center" ? "centre" : position;
  if (!ALLOWED_POSITIONS.has(normalized)) {
    throw new PipelineError("ERR_POSITION", `Unsupported position ${position}`);
  }
  return normalized;
}

export async function prepareSceneAsset({
  input,
  output,
  width,
  height,
  fit = "cover",
  position = "centre",
  expectedInputSha256 = undefined,
}) {
  if (!input || !output) {
    throw new PipelineError("ERR_ARGUMENT", "input and output are required");
  }

  const targetWidth = positiveInteger(width, "width");
  const targetHeight = positiveInteger(height, "height");
  const resolvedFit = normalizeFit(fit);
  const resolvedPosition = normalizePosition(position);
  const source = await inspectPng(input);

  if (expectedInputSha256 && source.sha256 !== expectedInputSha256) {
    throw new PipelineError("ERR_INPUT_HASH", `Input hash mismatch for ${input}`, {
      expected: expectedInputSha256,
      actual: source.sha256,
    });
  }

  const encoded = await sharp(repoFsPath(input), { failOn: "error", limitInputPixels: true })
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: resolvedFit,
      position: resolvedPosition,
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: false,
      palette: false,
      effort: 10,
      force: true,
    })
    .toBuffer();

  await writeFileAtomic(output, encoded);
  const prepared = await inspectPng(output);
  if (prepared.width !== targetWidth || prepared.height !== targetHeight) {
    throw new PipelineError("ERR_OUTPUT_DIMENSION", `Prepared scene has wrong dimensions: ${output}`, {
      expected: [targetWidth, targetHeight],
      actual: [prepared.width, prepared.height],
    });
  }

  return {
    input,
    output,
    source,
    prepared,
    transform: {
      width: targetWidth,
      height: targetHeight,
      fit: resolvedFit,
      position: resolvedPosition,
      kernel: "lanczos3",
      encoder: "sharp-png",
      compressionLevel: 9,
      adaptiveFiltering: false,
    },
    runtime: {
      node: process.version,
      sharp: SHARP_VERSION,
      vips: VIPS_VERSION,
      pipeline: SCENE_PIPELINE_VERSION,
    },
  };
}

function selectManifestAssets(manifest, values) {
  if (!Array.isArray(manifest.assets)) {
    throw new PipelineError("ERR_MANIFEST", "scene manifest assets must be an array");
  }
  const requested = values.asset ?? [];
  if (values.all && requested.length > 0) {
    throw new PipelineError("ERR_ARGUMENT", "Use either --all or --asset, not both");
  }
  if (!values.all && requested.length === 0) {
    throw new PipelineError("ERR_ARGUMENT", "Manifest mode requires --all or --asset <id>");
  }
  const selected = values.all
    ? manifest.assets.filter((asset) => asset.source?.rawPath)
    : requested.map((id) => {
        const asset = manifest.assets.find((candidate) => candidate.id === id);
        if (!asset) throw new PipelineError("ERR_ASSET_ID", `Unknown scene asset ${id}`);
        return asset;
      });
  return selected;
}

export async function prepareSceneManifest({ manifestPath, assetIds = [], all = false, writeManifest = false }) {
  assertRepoPath(manifestPath, PATH_PREFIXES.manifests, "manifestPath");
  const manifest = await readJson(manifestPath);
  assertRepoPath(manifest.approvedReference?.path, PATH_PREFIXES.references, "approvedReference.path");
  const selected = selectManifestAssets(manifest, { asset: assetIds, all });
  const results = [];

  for (const asset of selected) {
    if (!asset.source?.rawPath) {
      throw new PipelineError("ERR_SOURCE_PENDING", `No raw source for ${asset.id}`);
    }
    assertRepoPath(asset.prompt?.path, PATH_PREFIXES.prompts, `${asset.id}.prompt.path`);
    assertRepoPath(asset.source.rawPath, PATH_PREFIXES.sceneSources, `${asset.id}.source.rawPath`);
    assertRepoPath(asset.output?.path, PATH_PREFIXES.sceneOutputs, `${asset.id}.output.path`);
    const result = await prepareSceneAsset({
      input: asset.source.rawPath,
      output: asset.output.path,
      width: asset.output.width,
      height: asset.output.height,
      fit: asset.processing?.fit ?? "cover",
      position: asset.processing?.position ?? "centre",
      expectedInputSha256: asset.source.sha256,
    });
    asset.source.width = result.source.width;
    asset.source.height = result.source.height;
    asset.output.sha256 = result.prepared.sha256;
    asset.output.bytes = result.prepared.bytes;
    asset.output.hasAlpha = result.prepared.hasAlpha;
    asset.output.status = "mechanically-prepared";
    asset.processing = { ...asset.processing, ...result.transform };
    results.push({ id: asset.id, ...result });
  }

  manifest.pipeline = {
    ...(manifest.pipeline ?? {}),
    version: SCENE_PIPELINE_VERSION,
    node: process.version,
    sharp: SHARP_VERSION,
    vips: VIPS_VERSION,
  };
  if (writeManifest) await writeJsonAtomic(manifestPath, manifest);
  return { manifestPath, results, wroteManifest: writeManifest };
}

async function runSelfTest(scratch) {
  const scratchFs = assertSafeScratchPath(scratch);
  scratch = path.relative(REPO_ROOT, scratchFs);
  await rm(scratchFs, { recursive: true, force: true });
  await mkdir(scratchFs, { recursive: true });

  const sourcePath = path.join(scratch, "source.png");
  const sourceRaw = Buffer.alloc(8 * 4 * 3);
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const offset = (y * 8 + x) * 3;
      sourceRaw[offset] = x * 24;
      sourceRaw[offset + 1] = y * 48;
      sourceRaw[offset + 2] = 180;
    }
  }
  await sharp(sourceRaw, { raw: { width: 8, height: 4, channels: 3 } }).png().toFile(repoFsPath(sourcePath));

  const firstPath = path.join(scratch, "first.png");
  const secondPath = path.join(scratch, "second.png");
  const first = await prepareSceneAsset({ input: sourcePath, output: firstPath, width: 10, height: 6 });
  const second = await prepareSceneAsset({ input: sourcePath, output: secondPath, width: 10, height: 6 });
  if (first.prepared.sha256 !== second.prepared.sha256) {
    throw new PipelineError("ERR_NONDETERMINISTIC", "Repeated preparation produced different hashes");
  }
  if (first.prepared.width !== 10 || first.prepared.height !== 6) {
    throw new PipelineError("ERR_SELF_TEST", "Exact output dimensions were not preserved");
  }

  const badPath = path.join(scratch, "not-png.bin");
  await writeFile(repoFsPath(badPath), "not a png");
  const sentinelPath = path.join(scratch, "sentinel.png");
  await writeFile(repoFsPath(sentinelPath), "sentinel");
  let malformedRejected = false;
  try {
    await prepareSceneAsset({ input: badPath, output: sentinelPath, width: 10, height: 6 });
  } catch (error) {
    malformedRejected = error instanceof PipelineError && error.code === "ERR_NOT_PNG";
  }
  if (!malformedRejected || (await readFile(repoFsPath(sentinelPath), "utf8")) !== "sentinel") {
    throw new PipelineError("ERR_SELF_TEST", "Malformed PNG rejection was not atomic");
  }

  let dimensionRejected = false;
  try {
    await prepareSceneAsset({ input: sourcePath, output: firstPath, width: 0, height: 6 });
  } catch (error) {
    dimensionRejected = error instanceof PipelineError && error.code === "ERR_DIMENSION";
  }
  if (!dimensionRejected) {
    throw new PipelineError("ERR_SELF_TEST", "Invalid dimensions were not rejected");
  }

  let conflictingModesRejected = false;
  try {
    validateCliMode({ "self-test": true, manifest: "manifest.json" });
  } catch (error) {
    conflictingModesRejected = error instanceof PipelineError && error.code === "ERR_ARGUMENT";
  }
  if (!conflictingModesRejected) {
    throw new PipelineError("ERR_SELF_TEST", "Conflicting CLI modes were not rejected");
  }
  let unsafeScratchRejected = false;
  try {
    assertSafeScratchPath("../outside");
  } catch (error) {
    unsafeScratchRejected = error instanceof PipelineError && error.code === "ERR_UNSAFE_PATH";
  }
  if (!unsafeScratchRejected) throw new PipelineError("ERR_SELF_TEST", "Unsafe scratch path was not rejected");
  let unsafeOutputRejected = false;
  try {
    assertRepoPath("package.json", PATH_PREFIXES.sceneOutputs, "output");
  } catch (error) {
    unsafeOutputRejected = error instanceof PipelineError && error.code === "ERR_UNSAFE_PATH";
  }
  if (!unsafeOutputRejected) throw new PipelineError("ERR_SELF_TEST", "Unsafe output path was not rejected");
  const symlinkPath = path.join(scratch, "outside-link");
  await symlink(path.join(REPO_ROOT, "package.json"), repoFsPath(symlinkPath));
  let symlinkTraversalRejected = false;
  try {
    assertRepoPath(symlinkPath, scratch, "symlinkPath");
  } catch (error) {
    symlinkTraversalRejected = error instanceof PipelineError && error.code === "ERR_UNSAFE_PATH";
  }
  if (!symlinkTraversalRejected) throw new PipelineError("ERR_SELF_TEST", "Symbolic-link traversal was not rejected");

  return {
    status: "PASS",
    script: "prepare-scene-assets",
    checks: {
      deterministicHash: first.prepared.sha256,
      exactDimensions: [10, 6],
      malformedPngRejected: true,
      failedWriteAtomic: true,
      invalidDimensionRejected: true,
      conflictingModesRejected: true,
      unsafeScratchRejected: true,
      unsafeOutputRejected: true,
      symlinkTraversalRejected: true,
    },
    runtime: { node: process.version, sharp: SHARP_VERSION, vips: VIPS_VERSION },
  };
}

function parseCli(argv) {
  return parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      "self-test": { type: "boolean" },
      scratch: { type: "string" },
      input: { type: "string" },
      output: { type: "string" },
      width: { type: "string" },
      height: { type: "string" },
      fit: { type: "string" },
      position: { type: "string" },
      manifest: { type: "string" },
      all: { type: "boolean" },
      asset: { type: "string", multiple: true },
      "write-manifest": { type: "boolean" },
    },
  }).values;
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

function validateCliMode(values) {
  const modeCount = [values["self-test"], values.manifest].filter(Boolean).length;
  if (modeCount > 1) throw new PipelineError("ERR_ARGUMENT", "Choose exactly one execution mode");
  if (values["self-test"]) {
    assertOnlyOptions(values, new Set(["self-test", "scratch"]), "self-test");
    return "self-test";
  }
  if (values.manifest) {
    assertOnlyOptions(values, new Set(["manifest", "all", "asset", "write-manifest"]), "manifest");
    return "manifest";
  }
  assertOnlyOptions(values, new Set(["input", "output", "width", "height", "fit", "position"]), "direct");
  return "direct";
}

async function main(argv) {
  const values = parseCli(argv);
  const mode = validateCliMode(values);
  if (mode === "self-test") {
    const result = await runSelfTest(values.scratch ?? "tmp/archipelago-recovery/self-test/scene-prep");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === "manifest") {
    const result = await prepareSceneManifest({
      manifestPath: values.manifest,
      assetIds: values.asset ?? [],
      all: Boolean(values.all),
      writeManifest: Boolean(values["write-manifest"]),
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  assertRepoPath(values.input, PATH_PREFIXES.sceneSources, "input");
  assertRepoPath(values.output, PATH_PREFIXES.sceneOutputs, "output");
  const result = await prepareSceneAsset({
    input: values.input,
    output: values.output,
    width: values.width,
    height: values.height,
    fit: values.fit,
    position: values.position,
  });
  console.log(JSON.stringify(result, null, 2));
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    const usageError = error?.code?.startsWith?.("ERR_PARSE_ARGS") || error?.code === "ERR_ARGUMENT";
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = usageError ? 2 : 1;
  });
}
