/**
 * Camera state machine for the Living Archipelago world engine.
 * Honors the DESIGN.md §4 camera contract: fixed three-quarter view,
 * pan + zoom only, no rotation, transitions 240–600ms.
 * No PixiJS dependency — safe for Node tests.
 */

import { clamp, easeInOutCubic, lerp } from './math.ts';

export type CameraState = {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
};

export type WorldLayout = {
  readonly width: number;
  readonly height: number;
};

export type FocusBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scaleCap: number;
};

export const OVERVIEW_CAMERA: CameraState = { x: 0.5, y: 0.48, zoom: 1 };

export const FOCUS_TRANSITION_MS = 480;
export const VOYAGE_SEGMENT_MS = 600;

/**
 * Compute the camera target for a focus box (normalized 0–1 coordinates
 * from presentation-manifest focusBox).
 */
export function focusCameraTarget(box: FocusBox, layout: WorldLayout): CameraState {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const zoomForWidth = 1 / Math.max(box.width, 0.1);
  const zoomForHeight = 1 / Math.max(box.height, 0.1);
  const aspect = layout.width / Math.max(layout.height, 1);
  const zoom = clamp(
    Math.min(zoomForWidth, zoomForHeight * (aspect > 1 ? 1 : aspect)),
    1,
    box.scaleCap,
  );
  return { x: clamp(cx, 0, 1), y: clamp(cy, 0, 1), zoom };
}

/** Interpolate between two camera states with easing. */
export function tweenCamera(from: CameraState, to: CameraState, t: number): CameraState {
  const e = easeInOutCubic(clamp(t, 0, 1));
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e),
    zoom: lerp(from.zoom, to.zoom, e),
  };
}

/**
 * Convert a normalized world point to screen pixels given the current
 * camera and layout. Used to position DOM overlays over the canvas.
 */
export function worldToScreen(
  point: { readonly x: number; readonly y: number },
  camera: CameraState,
  layout: WorldLayout,
): { x: number; y: number } {
  const scale = camera.zoom;
  const viewW = layout.width / scale;
  const viewH = layout.height / scale;
  const left = camera.x * layout.width - viewW / 2;
  const top = camera.y * layout.height - viewH / 2;
  return {
    x: (point.x * layout.width - left) * scale,
    y: (point.y * layout.height - top) * scale,
  };
}

/** Voyage path: ordered normalized waypoints through the archipelago. */
export type VoyageWaypoint = {
  readonly x: number;
  readonly y: number;
  readonly projectId: string | null;
};

/**
 * Compute camera position along a voyage path for a given progress 0–1.
 * Used by the mobile vertical journey.
 */
export function voyageCameraAt(
  waypoints: readonly VoyageWaypoint[],
  progress: number,
): CameraState {
  if (waypoints.length === 0) return OVERVIEW_CAMERA;
  if (waypoints.length === 1) {
    return { x: waypoints[0].x, y: waypoints[0].y, zoom: 1.6 };
  }
  const t = clamp(progress, 0, 1) * (waypoints.length - 1);
  const index = Math.min(Math.floor(t), waypoints.length - 2);
  const local = t - index;
  const from = waypoints[index];
  const to = waypoints[index + 1];
  const e = easeInOutCubic(local);
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e),
    zoom: lerp(1.1, 1.7, Math.sin(e * Math.PI) * 0.4 + 0.3),
  };
}
