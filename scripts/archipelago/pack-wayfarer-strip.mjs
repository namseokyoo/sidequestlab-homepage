#!/usr/bin/env node

import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import sharp from "sharp";

import {
  PATH_PREFIXES,
  PipelineError,
  REPO_ROOT,
  SHARP_VERSION,
  VIPS_VERSION,
  assertRepoPath,
  assertSafeScratchPath,
  inspectPng,
  readJson,
  repoFsPath,
  writeFileAtomic,
  writeJsonAtomic,
} from "./prepare-scene-assets.mjs";

export const STRIP_PIPELINE_VERSION = "1.0.0";
export const REQUIRED_FRAME_COUNT = 8;

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PipelineError("ERR_ARGUMENT", `${label} must be a positive integer`);
  }
  return parsed;
}

function nonNegativeInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new PipelineError("ERR_ARGUMENT", `${label} must be a non-negative integer`);
  }
  return parsed;
}

function parseGrid(value = "4x2") {
  const match = /^(\d+)x(\d+)$/.exec(value);
  if (!match) throw new PipelineError("ERR_GRID", `Grid must be COLSxROWS, got ${value}`);
  const columns = positiveInteger(match[1], "grid columns");
  const rows = positiveInteger(match[2], "grid rows");
  if (columns * rows !== REQUIRED_FRAME_COUNT) {
    throw new PipelineError(
      "ERR_FRAME_COUNT",
      `Grid must contain exactly ${REQUIRED_FRAME_COUNT} frames, got ${columns * rows}`,
    );
  }
  return { columns, rows };
}

function alphaBounds(data, width, height, threshold = 16) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < threshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      pixels += 1;
    }
  }
  if (maxX < minX || maxY < minY) {
    throw new PipelineError("ERR_EMPTY_FRAME", "Frame contains no visible foreground");
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels };
}

function removeGreenBackground(data, { low = 24, high = 82, alphaCutoff = 6 } = {}) {
  if (!(Number.isFinite(low) && Number.isFinite(high) && Number.isFinite(alphaCutoff))) {
    throw new PipelineError("ERR_KEY_THRESHOLD", "Green key thresholds must be finite numbers");
  }
  if (!(low >= 0 && high > low && high <= 255 && alphaCutoff >= 0 && alphaCutoff <= 255)) {
    throw new PipelineError("ERR_KEY_THRESHOLD", "Green key thresholds are invalid");
  }
  const output = Buffer.from(data);
  let transparentPixels = 0;
  let partialPixels = 0;
  let residualGreenPixels = 0;

  for (let offset = 0; offset < output.length; offset += 4) {
    const red = output[offset];
    const green = output[offset + 1];
    const blue = output[offset + 2];
    const originalAlpha = output[offset + 3];
    const dominance = green - Math.max(red, blue);
    let keyedAlpha = 255;
    if (green >= 48 && dominance > low) {
      keyedAlpha = dominance >= high ? 0 : Math.round((255 * (high - dominance)) / (high - low));
    }
    let alpha = Math.round((originalAlpha * keyedAlpha) / 255);
    if (alpha <= alphaCutoff) alpha = 0;

    if (alpha < 255) {
      const neutral = Math.max(red, blue);
      output[offset + 1] = Math.min(green, neutral + 4);
    }
    output[offset + 3] = alpha;

    if (alpha === 0) transparentPixels += 1;
    else if (alpha < 255) partialPixels += 1;
    if (alpha > 0 && output[offset + 1] - Math.max(output[offset], output[offset + 2]) > high) {
      residualGreenPixels += 1;
    }
  }

  return { data: output, transparentPixels, partialPixels, residualGreenPixels, low, high, alphaCutoff };
}

function removeCheckerBackground(
  data,
  width,
  height,
  { maxChroma = 34, minLightness = 108, edgeChroma = 46, edgeLightness = 82 } = {},
) {
  const thresholds = [maxChroma, minLightness, edgeChroma, edgeLightness].map(Number);
  if (thresholds.some((value) => !Number.isFinite(value) || value < 0 || value > 255)) {
    throw new PipelineError("ERR_KEY_THRESHOLD", "Checker key thresholds must be finite values from 0 to 255");
  }
  const [resolvedMaxChroma, resolvedMinLightness, resolvedEdgeChroma, resolvedEdgeLightness] = thresholds;
  const output = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const isCandidate = (pixel) => {
    const offset = pixel * 4;
    const red = output[offset];
    const green = output[offset + 1];
    const blue = output[offset + 2];
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
    const lightness = Math.round((red + green + blue) / 3);
    return chroma <= resolvedMaxChroma && lightness >= resolvedMinLightness;
  };
  const enqueue = (pixel) => {
    if (visited[pixel] || !isCandidate(pixel)) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }
  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nextX = x + dx;
        const nextY = y + dy;
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
        enqueue(nextY * width + nextX);
      }
    }
  }

  let transparentPixels = 0;
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (!visited[pixel]) continue;
    output[pixel * 4 + 3] = 0;
    transparentPixels += 1;
  }

  let neutralEdgePixels = 0;
  const removeNeutralEdges = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (visited[pixel]) continue;
      const offset = pixel * 4;
      const red = output[offset];
      const green = output[offset + 1];
      const blue = output[offset + 2];
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
      const lightness = Math.round((red + green + blue) / 3);
      if (chroma > resolvedEdgeChroma || lightness < resolvedEdgeLightness) continue;
      const adjacentBackground =
        visited[pixel - 1] || visited[pixel + 1] || visited[pixel - width] || visited[pixel + width];
      if (adjacentBackground) removeNeutralEdges.push(pixel);
    }
  }
  for (const pixel of removeNeutralEdges) {
    output[pixel * 4 + 3] = 0;
    visited[pixel] = 1;
    neutralEdgePixels += 1;
  }

  return {
    data: output,
    mode: "checker-flood",
    transparentPixels,
    neutralEdgePixels,
    maxChroma: resolvedMaxChroma,
    minLightness: resolvedMinLightness,
    edgeChroma: resolvedEdgeChroma,
    edgeLightness: resolvedEdgeLightness,
  };
}

function isCheckerBackgroundPixel(data, pixel, maxChroma, minLightness) {
  const offset = pixel * 4;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  return (
    Math.max(red, green, blue) - Math.min(red, green, blue) <= maxChroma &&
    (red + green + blue) / 3 >= minLightness
  );
}

function findGutterCut(data, width, height, expected, axis, rangeStart, rangeEnd, keyOptions) {
  const radius = axis === "x" ? Math.min(112, Math.floor(width / 12)) : Math.min(96, Math.floor(height / 8));
  let best = null;
  for (let coordinate = expected - radius; coordinate <= expected + radius; coordinate += 1) {
    if (coordinate <= 4 || coordinate >= (axis === "x" ? width : height) - 5) continue;
    let foregroundScore = 0;
    for (let delta = -2; delta <= 2; delta += 1) {
      const line = coordinate + delta;
      if (axis === "x") {
        for (let y = rangeStart; y < rangeEnd; y += 2) {
          if (!isCheckerBackgroundPixel(data, y * width + line, keyOptions.maxChroma, keyOptions.minLightness)) {
            foregroundScore += 1;
          }
        }
      } else {
        for (let x = rangeStart; x < rangeEnd; x += 2) {
          if (!isCheckerBackgroundPixel(data, line * width + x, keyOptions.maxChroma, keyOptions.minLightness)) {
            foregroundScore += 1;
          }
        }
      }
    }
    const distance = Math.abs(coordinate - expected);
    if (!best || foregroundScore < best.foregroundScore || (foregroundScore === best.foregroundScore && distance < best.distance)) {
      best = { coordinate, foregroundScore, distance };
    }
  }
  if (!best) throw new PipelineError("ERR_GRID_GUTTER", `Unable to find ${axis}-axis checker gutter`);
  return best.coordinate;
}

async function checkerFrameRects(input, metadata, grid, keyOptions) {
  const { data } = await sharp(repoFsPath(input), { failOn: "error", limitInputPixels: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const horizontalCuts = [0];
  for (let row = 1; row < grid.rows; row += 1) {
    horizontalCuts.push(findGutterCut(
      data,
      metadata.width,
      metadata.height,
      Math.round((metadata.height * row) / grid.rows),
      "y",
      0,
      metadata.width,
      keyOptions,
    ));
  }
  horizontalCuts.push(metadata.height);
  const rects = [];
  for (let row = 0; row < grid.rows; row += 1) {
    const top = horizontalCuts[row];
    const bottom = horizontalCuts[row + 1];
    const verticalCuts = [0];
    for (let column = 1; column < grid.columns; column += 1) {
      verticalCuts.push(findGutterCut(
        data,
        metadata.width,
        metadata.height,
        Math.round((metadata.width * column) / grid.columns),
        "x",
        top,
        bottom,
        keyOptions,
      ));
    }
    verticalCuts.push(metadata.width);
    for (let column = 0; column < grid.columns; column += 1) {
      const left = verticalCuts[column];
      const right = verticalCuts[column + 1];
      if (right - left <= 8 || bottom - top <= 8) {
        throw new PipelineError("ERR_GRID_GUTTER", `Adaptive checker cell ${row}:${column} is too small`);
      }
      rects.push({ left, top, width: right - left, height: bottom - top });
    }
  }
  return rects;
}

export function detectGroundAnchors(data, width, height, bounds = alphaBounds(data, width, height), threshold = 16) {
  const startY = Math.max(bounds.minY, bounds.maxY - 17);
  const occupied = new Uint8Array(width);
  const bottomByX = new Int16Array(width).fill(-1);
  for (let y = startY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      if (data[(y * width + x) * 4 + 3] < threshold) continue;
      occupied[x] = 1;
      bottomByX[x] = Math.max(bottomByX[x], y);
    }
  }
  const groups = [];
  let start = -1;
  let last = -1;
  for (let x = bounds.minX; x <= bounds.maxX + 1; x += 1) {
    if (x <= bounds.maxX && occupied[x]) {
      if (start < 0) start = x;
      last = x;
      continue;
    }
    if (start >= 0) {
      let next = x + 1;
      while (next <= bounds.maxX && !occupied[next] && next - last <= 5) next += 1;
      if (next <= bounds.maxX && occupied[next] && next - last <= 5) continue;
      if (last - start + 1 >= 2) {
        let bottom = -1;
        for (let groupX = start; groupX <= last; groupX += 1) bottom = Math.max(bottom, bottomByX[groupX]);
        groups.push({ minX: start, maxX: last, centerX: Math.round((start + last) / 2), bottomY: bottom + 1 });
      }
      start = -1;
      last = -1;
    }
  }
  if (groups.length < 2) {
    throw new PipelineError("ERR_ANCHOR_DETECTION", "Could not detect distinct equipment and planted-foot ground anchors", {
      bounds,
      groups,
    });
  }
  const equipment = groups[0];
  const plantedFoot = groups.at(-1);
  return {
    equipment: [equipment.centerX, equipment.bottomY],
    plantedFoot: [plantedFoot.centerX, plantedFoot.bottomY],
    groups,
  };
}

async function extractKeyedFrames(input, grid, keyOptions) {
  const metadata = await inspectPng(input);
  if (metadata.width % grid.columns !== 0 || metadata.height % grid.rows !== 0) {
    throw new PipelineError("ERR_GRID_DIMENSION", "Raw sheet dimensions must divide evenly by the grid", {
      dimensions: [metadata.width, metadata.height],
      grid,
    });
  }
  const frameWidth = metadata.width / grid.columns;
  const frameHeight = metadata.height / grid.rows;
  const frameRects = keyOptions.mode === "checker-flood"
    ? await checkerFrameRects(input, metadata, grid, keyOptions)
    : Array.from({ length: REQUIRED_FRAME_COUNT }, (_, index) => ({
        left: (index % grid.columns) * frameWidth,
        top: Math.floor(index / grid.columns) * frameHeight,
        width: frameWidth,
        height: frameHeight,
      }));
  const frames = [];

  for (let index = 0; index < REQUIRED_FRAME_COUNT; index += 1) {
    const rect = frameRects[index];
    const { data, info } = await sharp(repoFsPath(input), { failOn: "error", limitInputPixels: true })
      .extract(rect)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const keyed = keyOptions.mode === "checker-flood"
      ? removeCheckerBackground(data, info.width, info.height, keyOptions)
      : removeGreenBackground(data, keyOptions);
    const bounds = alphaBounds(keyed.data, info.width, info.height);
    const sourceBoundContact =
      bounds.minX === 0 || bounds.minY === 0 || bounds.maxX === info.width - 1 || bounds.maxY === info.height - 1;
    if (sourceBoundContact) {
      throw new PipelineError("ERR_BOUND_CONTACT", `Foreground touches raw frame bounds in frame ${index}`, {
        index,
        bounds,
        frame: [info.width, info.height],
      });
    }
    frames.push({
      index,
      sourceRect: rect,
      width: info.width,
      height: info.height,
      data: keyed.data,
      bounds,
      sourceBoundContact,
      key: {
        mode: keyed.mode ?? "green-dominance",
        transparentPixels: keyed.transparentPixels,
        partialPixels: keyed.partialPixels ?? 0,
        residualGreenPixels: keyed.residualGreenPixels ?? 0,
        neutralEdgePixels: keyed.neutralEdgePixels ?? 0,
      },
    });
  }
  return { metadata, frameWidth, frameHeight, frames };
}

function normalizeAnchorSpec(anchors) {
  if (anchors === undefined) return undefined;
  const normalizePoint = (entry, label) => {
    if (!entry?.name || !Array.isArray(entry.target) || entry.target.length !== 2) {
      throw new PipelineError("ERR_ANCHOR_SPEC", `${label} needs a name and target [x,y]`);
    }
    const target = entry.target.map(Number);
    if (target.some((value) => !Number.isInteger(value) || value < 0)) {
      throw new PipelineError("ERR_ANCHOR_SPEC", `${label} target must contain non-negative integers`);
    }
    return { name: entry.name, target };
  };
  const maxDeviationPx = Number(anchors.maxDeviationPx);
  if (!Number.isInteger(maxDeviationPx) || maxDeviationPx < 0) {
    throw new PipelineError("ERR_ANCHOR_SPEC", "anchors.maxDeviationPx must be a non-negative integer");
  }
  const equipment = normalizePoint(anchors.equipment, "equipment anchor");
  const plantedFoot = normalizePoint(anchors.plantedFoot, "planted-foot anchor");
  if (plantedFoot.target[0] <= equipment.target[0]) {
    throw new PipelineError("ERR_ANCHOR_SPEC", "planted-foot target X must be right of equipment target X");
  }
  return { equipment, plantedFoot, maxDeviationPx };
}

function shearAnchorBaseline(data, width, height, detected, targetDeltaY) {
  const actualDeltaY = detected.plantedFoot[1] - detected.equipment[1];
  const correction = targetDeltaY - actualDeltaY;
  if (correction === 0) return { data, correction };
  if (Math.abs(correction) > 12) {
    throw new PipelineError("ERR_ANCHOR_SHEAR", `Required baseline shear ${correction}px exceeds 12px safety cap`);
  }
  const output = Buffer.alloc(data.length);
  const startX = detected.equipment[0];
  const endX = detected.plantedFoot[0];
  const span = Math.max(1, endX - startX);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const progress = Math.max(0, Math.min(1, (x - startX) / span));
      const destinationY = y + Math.round(correction * progress);
      if (destinationY < 0 || destinationY >= height) continue;
      const sourceOffset = (y * width + x) * 4;
      const destinationOffset = (destinationY * width + x) * 4;
      data.copy(output, destinationOffset, sourceOffset, sourceOffset + 4);
    }
  }
  return { data: output, correction };
}

async function cropAndScaleFrame(frame, scaleY, anchorSpec) {
  const { bounds } = frame;
  const sourceAnchors = anchorSpec
    ? detectGroundAnchors(frame.data, frame.width, frame.height, bounds)
    : undefined;
  const sourceSpan = sourceAnchors
    ? sourceAnchors.plantedFoot[0] - sourceAnchors.equipment[0]
    : bounds.width;
  if (!(sourceSpan > 0)) throw new PipelineError("ERR_ANCHOR_SPAN", `Frame ${frame.index} anchor span must be positive`);
  const targetSpan = anchorSpec
    ? anchorSpec.plantedFoot.target[0] - anchorSpec.equipment.target[0]
    : bounds.width * scaleY;
  let scaleX = anchorSpec ? targetSpan / sourceSpan : scaleY;
  let cropped = await sharp(frame.data, {
    raw: { width: frame.width, height: frame.height, channels: 4 },
  })
    .extract({ left: bounds.minX, top: bounds.minY, width: bounds.width, height: bounds.height })
    .resize({
      width: Math.max(1, Math.round(bounds.width * scaleX)),
      height: Math.max(1, Math.round(bounds.height * scaleY)),
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let scaledBounds = alphaBounds(cropped.data, cropped.info.width, cropped.info.height);
  let scaledAnchors = anchorSpec
    ? detectGroundAnchors(cropped.data, cropped.info.width, cropped.info.height, scaledBounds)
    : undefined;
  for (let attempt = 0; anchorSpec && attempt < 3; attempt += 1) {
    const actualSpan = scaledAnchors.plantedFoot[0] - scaledAnchors.equipment[0];
    if (Math.abs(actualSpan - targetSpan) <= 1) break;
    const correctedWidth = Math.max(1, Math.round(cropped.info.width * targetSpan / actualSpan));
    cropped = await sharp(cropped.data, {
      raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
    })
      .resize({ width: correctedWidth, height: cropped.info.height, fit: "fill", kernel: sharp.kernel.lanczos3 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    scaleX = correctedWidth / bounds.width;
    scaledBounds = alphaBounds(cropped.data, cropped.info.width, cropped.info.height);
    scaledAnchors = detectGroundAnchors(cropped.data, cropped.info.width, cropped.info.height, scaledBounds);
  }
  let baselineShearPx = 0;
  if (anchorSpec) {
    const targetDeltaY = anchorSpec.plantedFoot.target[1] - anchorSpec.equipment.target[1];
    const sheared = shearAnchorBaseline(cropped.data, cropped.info.width, cropped.info.height, scaledAnchors, targetDeltaY);
    baselineShearPx = sheared.correction;
    if (baselineShearPx !== 0) {
      cropped = { data: sheared.data, info: cropped.info };
      scaledBounds = alphaBounds(cropped.data, cropped.info.width, cropped.info.height);
      scaledAnchors = detectGroundAnchors(cropped.data, cropped.info.width, cropped.info.height, scaledBounds);
    }
  }
  return {
    data: cropped.data,
    width: cropped.info.width,
    height: cropped.info.height,
    scaleX,
    scaleY,
    sourceAnchors,
    scaledAnchors,
    baselineShearPx,
  };
}

export async function packWayfarerStrip({
  input,
  output,
  grid = "4x2",
  cellSize = 256,
  padding = 12,
  pivotX = 128,
  pivotY = 240,
  keyLow = 24,
  keyHigh = 82,
  alphaCutoff = 6,
  keyMode = "green-dominance",
  checkerMaxChroma = 34,
  checkerMinLightness = 108,
  checkerEdgeChroma = 46,
  checkerEdgeLightness = 82,
  anchors = undefined,
  expectedInputSha256 = undefined,
  report = undefined,
}) {
  if (!input || !output) throw new PipelineError("ERR_ARGUMENT", "input and output are required");
  const parsedGrid = typeof grid === "string" ? parseGrid(grid) : grid;
  if (parsedGrid.columns * parsedGrid.rows !== REQUIRED_FRAME_COUNT) {
    throw new PipelineError("ERR_FRAME_COUNT", `Exactly ${REQUIRED_FRAME_COUNT} frames are required`);
  }
  const resolvedCellSize = positiveInteger(cellSize, "cellSize");
  const resolvedPadding = nonNegativeInteger(padding, "padding");
  const resolvedPivotX = nonNegativeInteger(pivotX, "pivotX");
  const resolvedPivotY = nonNegativeInteger(pivotY, "pivotY");
  const anchorSpec = normalizeAnchorSpec(anchors);
  if (!["green-dominance", "checker-flood"].includes(keyMode)) {
    throw new PipelineError("ERR_KEY_MODE", `Unsupported key mode ${keyMode}`);
  }
  if (
    resolvedPadding * 2 >= resolvedCellSize ||
    resolvedPivotX <= resolvedPadding ||
    resolvedPivotX >= resolvedCellSize - resolvedPadding ||
    resolvedPivotY <= resolvedPadding ||
    resolvedPivotY >= resolvedCellSize - resolvedPadding
  ) {
    throw new PipelineError("ERR_PIVOT", "padding and target pivot must stay inside each cell");
  }

  const source = await inspectPng(input);
  if (expectedInputSha256 && source.sha256 !== expectedInputSha256) {
    throw new PipelineError("ERR_INPUT_HASH", `Input hash mismatch for ${input}`, {
      expected: expectedInputSha256,
      actual: source.sha256,
    });
  }

  const extracted = await extractKeyedFrames(input, parsedGrid, {
    mode: keyMode,
    low: Number(keyLow),
    high: Number(keyHigh),
    alphaCutoff: Number(alphaCutoff),
    maxChroma: Number(checkerMaxChroma),
    minLightness: Number(checkerMinLightness),
    edgeChroma: Number(checkerEdgeChroma),
    edgeLightness: Number(checkerEdgeLightness),
  });
  const maxWidth = Math.max(...extracted.frames.map((frame) => frame.bounds.width));
  const maxHeight = Math.max(...extracted.frames.map((frame) => frame.bounds.height));
  const availableWidth = resolvedCellSize - resolvedPadding * 2;
  const availableHeight = resolvedPivotY - resolvedPadding;
  const commonScale = Math.min(1, availableWidth / maxWidth, availableHeight / maxHeight);
  if (!(commonScale > 0)) throw new PipelineError("ERR_SCALE", "Cannot derive a positive common scale");

  const composites = [];
  const frameReports = [];
  for (const frame of extracted.frames) {
    const scaled = await cropAndScaleFrame(frame, commonScale, anchorSpec);
    const leftInCell = anchorSpec
      ? anchorSpec.equipment.target[0] - scaled.scaledAnchors.equipment[0]
      : Math.round(resolvedPivotX - scaled.width / 2);
    const top = anchorSpec
      ? anchorSpec.equipment.target[1] - scaled.scaledAnchors.equipment[1]
      : resolvedPivotY - scaled.height;
    if (
      leftInCell < resolvedPadding ||
      leftInCell + scaled.width > resolvedCellSize - resolvedPadding ||
      top < resolvedPadding ||
      resolvedPivotY >= resolvedCellSize - resolvedPadding
    ) {
      throw new PipelineError("ERR_PACK_BOUNDS", `Packed frame ${frame.index} violates cell padding`, {
        frame: frame.index,
        leftInCell,
        top,
        scaled: [scaled.width, scaled.height],
        padding: resolvedPadding,
        anchors: scaled.scaledAnchors,
      });
    }
    const placedAnchors = anchorSpec
      ? {
          equipment: [leftInCell + scaled.scaledAnchors.equipment[0], top + scaled.scaledAnchors.equipment[1]],
          plantedFoot: [leftInCell + scaled.scaledAnchors.plantedFoot[0], top + scaled.scaledAnchors.plantedFoot[1]],
        }
      : undefined;
    const anchorDeviations = anchorSpec
      ? {
          equipment: placedAnchors.equipment.map((value, axis) => Math.abs(value - anchorSpec.equipment.target[axis])),
          plantedFoot: placedAnchors.plantedFoot.map((value, axis) => Math.abs(value - anchorSpec.plantedFoot.target[axis])),
        }
      : undefined;
    if (
      anchorSpec &&
      [...anchorDeviations.equipment, ...anchorDeviations.plantedFoot].some(
        (value) => value > anchorSpec.maxDeviationPx,
      )
    ) {
      throw new PipelineError("ERR_ANCHOR_DRIFT", `Frame ${frame.index} exceeds anchor tolerance`, {
        anchorSpec,
        placedAnchors,
        anchorDeviations,
      });
    }
    const left = frame.index * resolvedCellSize + leftInCell;
    composites.push({
      input: scaled.data,
      raw: { width: scaled.width, height: scaled.height, channels: 4 },
      left,
      top,
    });
    frameReports.push({
      index: frame.index,
      sourceBounds: frame.bounds,
      placedBounds: {
        minX: leftInCell,
        minY: top,
        maxX: leftInCell + scaled.width - 1,
        maxY: top + scaled.height - 1,
        width: scaled.width,
        height: scaled.height,
      },
      targetPivot: [resolvedPivotX, resolvedPivotY],
      computedFootY: anchorSpec ? placedAnchors.plantedFoot[1] : resolvedPivotY,
      pivotDeviationPx: anchorSpec
        ? Math.abs(placedAnchors.plantedFoot[1] - anchorSpec.plantedFoot.target[1])
        : 0,
      anchors: anchorSpec
        ? {
            equipment: { name: anchorSpec.equipment.name, target: anchorSpec.equipment.target, actual: placedAnchors.equipment, deviation: anchorDeviations.equipment },
            plantedFoot: { name: anchorSpec.plantedFoot.name, target: anchorSpec.plantedFoot.target, actual: placedAnchors.plantedFoot, deviation: anchorDeviations.plantedFoot },
            maximumDeviationPx: anchorSpec.maxDeviationPx,
            sourceDetected: scaled.sourceAnchors,
            scale: [scaled.scaleX, scaled.scaleY],
            baselineShearPx: scaled.baselineShearPx,
          }
        : null,
      key: frame.key,
      sourceBoundContact: frame.sourceBoundContact,
    });
  }

  const encoded = await sharp({
    create: {
      width: resolvedCellSize * REQUIRED_FRAME_COUNT,
      height: resolvedCellSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false, effort: 10 })
    .toBuffer();

  await writeFileAtomic(output, encoded);
  const prepared = await inspectPng(output, { requireAlpha: true });
  const result = {
    input,
    output,
    source,
    prepared,
    grid: { columns: parsedGrid.columns, rows: parsedGrid.rows, frameCount: REQUIRED_FRAME_COUNT },
    cell: { width: resolvedCellSize, height: resolvedCellSize, padding: resolvedPadding },
    commonScale,
    targetPivot: [resolvedPivotX, resolvedPivotY],
    key: keyMode === "checker-flood"
      ? { mode: keyMode, maxChroma: Number(checkerMaxChroma), minLightness: Number(checkerMinLightness), edgeChroma: Number(checkerEdgeChroma), edgeLightness: Number(checkerEdgeLightness) }
      : { mode: keyMode, low: Number(keyLow), high: Number(keyHigh), alphaCutoff: Number(alphaCutoff) },
    anchors: anchorSpec ?? null,
    frames: frameReports,
    runtime: {
      node: process.version,
      sharp: SHARP_VERSION,
      vips: VIPS_VERSION,
      pipeline: STRIP_PIPELINE_VERSION,
    },
  };
  if (report) await writeJsonAtomic(report, result);
  return result;
}

function selectManifestStrips(manifest, values) {
  if (!Array.isArray(manifest.strips)) {
    throw new PipelineError("ERR_MANIFEST", "strip manifest strips must be an array");
  }
  const requested = values.strip ?? [];
  if (values.all && requested.length > 0) {
    throw new PipelineError("ERR_ARGUMENT", "Use either --all or --strip, not both");
  }
  if (!values.all && requested.length === 0) {
    throw new PipelineError("ERR_ARGUMENT", "Manifest mode requires --all or --strip <id>");
  }
  return values.all
    ? manifest.strips.filter((strip) => strip.source?.rawPath)
    : requested.map((id) => {
        const strip = manifest.strips.find((candidate) => candidate.id === id);
        if (!strip) throw new PipelineError("ERR_STRIP_ID", `Unknown strip ${id}`);
        return strip;
      });
}

export async function packWayfarerManifest({ manifestPath, stripIds = [], all = false, writeManifest = false }) {
  assertRepoPath(manifestPath, PATH_PREFIXES.manifests, "manifestPath");
  const manifest = await readJson(manifestPath);
  assertRepoPath(manifest.approvedReference?.path, PATH_PREFIXES.references, "approvedReference.path");
  const selected = selectManifestStrips(manifest, { strip: stripIds, all });
  const results = [];
  for (const strip of selected) {
    if (!strip.source?.rawPath) throw new PipelineError("ERR_SOURCE_PENDING", `No raw source for ${strip.id}`);
    assertRepoPath(strip.prompt?.path, PATH_PREFIXES.prompts, `${strip.id}.prompt.path`);
    assertRepoPath(strip.source.rawPath, PATH_PREFIXES.sceneSources, `${strip.id}.source.rawPath`);
    assertRepoPath(strip.output?.path, PATH_PREFIXES.stripOutputs, `${strip.id}.output.path`);
    assertRepoPath(strip.processing?.reportPath, PATH_PREFIXES.stripReports, `${strip.id}.processing.reportPath`);
    const result = await packWayfarerStrip({
      input: strip.source.rawPath,
      output: strip.output.path,
      grid: `${strip.source.grid.columns}x${strip.source.grid.rows}`,
      cellSize: strip.output.cellSize,
      padding: strip.processing.padding,
      pivotX: strip.processing.targetPivot[0],
      pivotY: strip.processing.targetPivot[1],
      keyLow: strip.processing.key.low,
      keyHigh: strip.processing.key.high,
      alphaCutoff: strip.processing.key.alphaCutoff,
      keyMode: strip.processing.key.mode,
      checkerMaxChroma: strip.processing.key.maxChroma,
      checkerMinLightness: strip.processing.key.minLightness,
      checkerEdgeChroma: strip.processing.key.edgeChroma,
      checkerEdgeLightness: strip.processing.key.edgeLightness,
      anchors: strip.processing.anchors,
      expectedInputSha256: strip.source.sha256,
      report: strip.processing.reportPath,
    });
    strip.output.sha256 = result.prepared.sha256;
    strip.output.bytes = result.prepared.bytes;
    strip.output.width = result.prepared.width;
    strip.output.height = result.prepared.height;
    strip.output.hasAlpha = result.prepared.hasAlpha;
    strip.output.status = "mechanically-prepared";
    strip.processing.commonScale = result.commonScale;
    strip.processing.frames = result.frames;
    results.push({ id: strip.id, ...result });
  }
  manifest.pipeline = {
    ...(manifest.pipeline ?? {}),
    version: STRIP_PIPELINE_VERSION,
    node: process.version,
    sharp: SHARP_VERSION,
    vips: VIPS_VERSION,
  };
  if (writeManifest) await writeJsonAtomic(manifestPath, manifest);
  return { manifestPath, results, wroteManifest: writeManifest };
}

async function makeSyntheticSheet(filePath, columns = 4, rows = 2) {
  const frameWidth = 40;
  const frameHeight = 48;
  const width = frameWidth * columns;
  const height = frameHeight * rows;
  const data = Buffer.alloc(width * height * 3);
  for (let offset = 0; offset < data.length; offset += 3) {
    data[offset] = 0;
    data[offset + 1] = 255;
    data[offset + 2] = 0;
  }
  for (let index = 0; index < columns * rows; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = column * frameWidth + 10;
    const top = row * frameHeight + 8 + (index % 3);
    const bottom = row * frameHeight + 39 - (index % 2);
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x < left + 18; x += 1) {
        const offset = (y * width + x) * 3;
        data[offset] = 220;
        data[offset + 1] = 70;
        data[offset + 2] = 50;
      }
    }
  }
  await sharp(data, { raw: { width, height, channels: 3 } }).png().toFile(repoFsPath(filePath));
}

async function makeCheckerSheet(filePath) {
  const frameWidth = 40;
  const frameHeight = 48;
  const width = frameWidth * 4;
  const height = frameHeight * 2;
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = (Math.floor(x / 6) + Math.floor(y / 6)) % 2 === 0 ? 246 : 226;
      const offset = (y * width + x) * 3;
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
    }
  }
  for (let index = 0; index < REQUIRED_FRAME_COUNT; index += 1) {
    const originX = (index % 4) * frameWidth;
    const originY = Math.floor(index / 4) * frameHeight;
    for (let y = originY + 15; y < originY + 40; y += 1) {
      for (let x = originX + 8; x <= originX + 14; x += 1) {
        const offset = (y * width + x) * 3;
        data[offset] = 75;
        data[offset + 1] = 50;
        data[offset + 2] = 30;
      }
    }
    for (let y = originY + 10; y < originY + 38; y += 1) {
      for (let x = originX + 22; x <= originX + 30; x += 1) {
        const offset = (y * width + x) * 3;
        data[offset] = 210;
        data[offset + 1] = 70;
        data[offset + 2] = 45;
      }
    }
    for (let y = originY + 19; y <= originY + 24; y += 1) {
      for (let x = originX + 24; x <= originX + 27; x += 1) {
        const offset = (y * width + x) * 3;
        data[offset] = 250;
        data[offset + 1] = 248;
        data[offset + 2] = 242;
      }
    }
  }
  await sharp(data, { raw: { width, height, channels: 3 } }).png().toFile(repoFsPath(filePath));
}

async function runSelfTest(scratch) {
  const scratchFs = assertSafeScratchPath(scratch);
  scratch = path.relative(REPO_ROOT, scratchFs);
  await rm(scratchFs, { recursive: true, force: true });
  await mkdir(scratchFs, { recursive: true });
  const source = path.join(scratch, "source.png");
  const firstPath = path.join(scratch, "first.png");
  const secondPath = path.join(scratch, "second.png");
  await makeSyntheticSheet(source);
  const first = await packWayfarerStrip({ input: source, output: firstPath });
  const second = await packWayfarerStrip({ input: source, output: secondPath });
  if (first.prepared.sha256 !== second.prepared.sha256) {
    throw new PipelineError("ERR_NONDETERMINISTIC", "Repeated strip packing produced different hashes");
  }
  if (
    first.prepared.width !== REQUIRED_FRAME_COUNT * 256 ||
    first.prepared.height !== 256 ||
    !first.prepared.hasAlpha
  ) {
    throw new PipelineError("ERR_SELF_TEST", "Packed strip dimensions or alpha are invalid");
  }
  if (first.frames.some((frame) => frame.computedFootY !== 240 || frame.pivotDeviationPx > 2)) {
    throw new PipelineError("ERR_SELF_TEST", "Frames were not registered to the shared foot pivot");
  }

  let frameCountRejected = false;
  try {
    parseGrid("7x1");
  } catch (error) {
    frameCountRejected = error instanceof PipelineError && error.code === "ERR_FRAME_COUNT";
  }
  if (!frameCountRejected) throw new PipelineError("ERR_SELF_TEST", "Seven-frame grid was not rejected");

  const touching = path.join(scratch, "touching.png");
  const red = Buffer.alloc(40 * 48 * 3);
  for (let offset = 0; offset < red.length; offset += 3) {
    red[offset] = 220;
    red[offset + 1] = 30;
    red[offset + 2] = 20;
  }
  await sharp(red, { raw: { width: 40, height: 48, channels: 3 } })
    .extend({ right: 120, bottom: 48, background: { r: 220, g: 30, b: 20 } })
    .png()
    .toFile(repoFsPath(touching));
  let touchingRejected = false;
  try {
    await packWayfarerStrip({ input: touching, output: path.join(scratch, "touching-output.png") });
  } catch (error) {
    touchingRejected = error instanceof PipelineError && error.code === "ERR_BOUND_CONTACT";
  }
  if (!touchingRejected) throw new PipelineError("ERR_SELF_TEST", "Foreground bound contact was not rejected");

  let invalidAlphaCutoffRejected = false;
  try {
    await packWayfarerStrip({ input: source, output: path.join(scratch, "invalid-alpha.png"), alphaCutoff: "NaN" });
  } catch (error) {
    invalidAlphaCutoffRejected = error instanceof PipelineError && error.code === "ERR_KEY_THRESHOLD";
  }
  if (!invalidAlphaCutoffRejected) {
    throw new PipelineError("ERR_SELF_TEST", "Non-numeric alpha cutoff was not rejected");
  }

  const checkerSource = path.join(scratch, "checker-source.png");
  const checkerOutput = path.join(scratch, "checker-output.png");
  await makeCheckerSheet(checkerSource);
  const checker = await packWayfarerStrip({
    input: checkerSource,
    output: checkerOutput,
    keyMode: "checker-flood",
    anchors: {
      equipment: { name: "synthetic-equipment", target: [64, 240] },
      plantedFoot: { name: "synthetic-planted-foot", target: [79, 238] },
      maxDeviationPx: 2,
    },
  });
  if (
    checker.frames.some((frame) =>
      frame.sourceBoundContact ||
      [...frame.anchors.equipment.deviation, ...frame.anchors.plantedFoot.deviation].some((value) => value > 2),
    )
  ) {
    throw new PipelineError("ERR_SELF_TEST", "Checker flood or semantic anchor registration failed");
  }
  const { data: checkerPixels } = await sharp(repoFsPath(checkerOutput)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let preservedWhitePixels = 0;
  for (let offset = 0; offset < checkerPixels.length; offset += 4) {
    if (
      checkerPixels[offset] > 235 && checkerPixels[offset + 1] > 235 &&
      checkerPixels[offset + 2] > 230 && checkerPixels[offset + 3] > 16
    ) preservedWhitePixels += 1;
  }
  if (preservedWhitePixels === 0) throw new PipelineError("ERR_SELF_TEST", "Enclosed white subject detail was removed");

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
  let unsafeReportRejected = false;
  try {
    assertRepoPath("package.json", PATH_PREFIXES.stripReports, "report");
  } catch (error) {
    unsafeReportRejected = error instanceof PipelineError && error.code === "ERR_UNSAFE_PATH";
  }
  if (!unsafeReportRejected) throw new PipelineError("ERR_SELF_TEST", "Unsafe report path was not rejected");

  return {
    status: "PASS",
    script: "pack-wayfarer-strip",
    checks: {
      deterministicHash: first.prepared.sha256,
      exactDimensions: [2048, 256],
      alpha: true,
      frameCount: 8,
      sevenFrameGridRejected: true,
      boundContactRejected: true,
      sharedPivot: [128, 240],
      maximumPivotDeviationPx: 0,
      invalidAlphaCutoffRejected: true,
      checkerFloodBackgroundRemoved: true,
      enclosedWhiteSubjectPreserved: true,
      semanticAnchorRegistration: true,
      conflictingModesRejected: true,
      unsafeScratchRejected: true,
      unsafeReportRejected: true,
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
      grid: { type: "string" },
      "cell-size": { type: "string" },
      padding: { type: "string" },
      "pivot-x": { type: "string" },
      "pivot-y": { type: "string" },
      "key-low": { type: "string" },
      "key-high": { type: "string" },
      "alpha-cutoff": { type: "string" },
      "key-mode": { type: "string" },
      "checker-max-chroma": { type: "string" },
      "checker-min-lightness": { type: "string" },
      "checker-edge-chroma": { type: "string" },
      "checker-edge-lightness": { type: "string" },
      report: { type: "string" },
      manifest: { type: "string" },
      all: { type: "boolean" },
      strip: { type: "string", multiple: true },
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
    assertOnlyOptions(values, new Set(["manifest", "all", "strip", "write-manifest"]), "manifest");
    return "manifest";
  }
  assertOnlyOptions(values, new Set([
    "input", "output", "grid", "cell-size", "padding", "pivot-x", "pivot-y", "key-low", "key-high",
    "alpha-cutoff", "key-mode", "checker-max-chroma", "checker-min-lightness", "checker-edge-chroma",
    "checker-edge-lightness", "report",
  ]), "direct");
  return "direct";
}

async function main(argv) {
  const values = parseCli(argv);
  const mode = validateCliMode(values);
  if (mode === "self-test") {
    const result = await runSelfTest(values.scratch ?? "tmp/archipelago-recovery/self-test/strip-pack");
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (mode === "manifest") {
    const result = await packWayfarerManifest({
      manifestPath: values.manifest,
      stripIds: values.strip ?? [],
      all: Boolean(values.all),
      writeManifest: Boolean(values["write-manifest"]),
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  assertRepoPath(values.input, PATH_PREFIXES.sceneSources, "input");
  assertRepoPath(values.output, PATH_PREFIXES.stripOutputs, "output");
  if (values.report) assertRepoPath(values.report, PATH_PREFIXES.stripReports, "report");
  const result = await packWayfarerStrip({
    input: values.input,
    output: values.output,
    grid: values.grid,
    cellSize: values["cell-size"],
    padding: values.padding,
    pivotX: values["pivot-x"],
    pivotY: values["pivot-y"],
    keyLow: values["key-low"],
    keyHigh: values["key-high"],
    alphaCutoff: values["alpha-cutoff"],
    keyMode: values["key-mode"],
    checkerMaxChroma: values["checker-max-chroma"],
    checkerMinLightness: values["checker-min-lightness"],
    checkerEdgeChroma: values["checker-edge-chroma"],
    checkerEdgeLightness: values["checker-edge-lightness"],
    report: values.report,
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
