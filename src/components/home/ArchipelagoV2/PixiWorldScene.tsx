'use client';

import { useEffect, useRef } from 'react';

import { createWorldEngine, type WorldEngine } from '@/lib/archipelago-world/engine';
import { WORLD_HEIGHT, WORLD_WIDTH, type IslandKind, type IslandLayout } from '@/lib/archipelago-world/islands';
import { screenToWorld, type FocusBox } from '@/lib/archipelago-world/camera';

export type PixiWorldSceneHandle = {
  readonly focusIsland: (id: IslandKind, focusBox: FocusBox) => void;
  readonly showOverview: () => void;
  readonly setNight: (night: number) => void;
  readonly setVoyageProgress: (progress: number) => void;
  readonly setVoyageWaypoints: (waypoints: readonly { x: number; y: number; projectId: string | null }[]) => void;
  readonly waveWayfarers: () => void;
  readonly setHighlightIsland: (id: string | null) => void;
  readonly zoomBy: (factor: number, centerScreen?: { x: number; y: number }) => void;
  readonly panBy: (dxScreen: number, dyScreen: number) => void;
  readonly onTick: (cb: (camera: { x: number; y: number; zoom: number }, night: number) => void) => () => void;
};

type PixiWorldSceneProps = {
  readonly onReady?: (handle: PixiWorldSceneHandle) => void;
  readonly motionEnabled: boolean;
  readonly islandIds?: readonly string[];
  readonly islandLifecycles?: Readonly<Record<string, string>>;
  /** Island layout data used to hit-test taps against island centers. */
  readonly islandLayouts?: readonly IslandLayout[];
  /** Fired when a tap (not a drag) lands on an island. */
  readonly onIslandClick?: (islandId: string) => void;
  readonly className?: string;
};

export function PixiWorldScene({ onReady, motionEnabled, islandIds, islandLifecycles, islandLayouts, onIslandClick, className }: PixiWorldSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);
  const motionRef = useRef(motionEnabled);
  motionRef.current = motionEnabled;

  // Latest tap-hit-test inputs for the pointer handlers registered once.
  const layoutsRef = useRef(islandLayouts);
  layoutsRef.current = islandLayouts;
  const onIslandClickRef = useRef(onIslandClick);
  onIslandClickRef.current = onIslandClick;

  const handleRef = useRef<PixiWorldSceneHandle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const engine = createWorldEngine({
      canvas,
      width: Math.max(rect.width, 320),
      height: Math.max(rect.height, 400),
      motionEnabled: motionRef.current,
      islandIds,
      islandLifecycles,
    });
    engineRef.current = engine;

    engine.ready.then(() => {
      const handle: PixiWorldSceneHandle = {
        focusIsland: (id, focusBox) => engine.focusIsland(id, focusBox),
        showOverview: () => engine.showOverview(),
        setNight: (night) => engine.setNight(night),
        setVoyageProgress: (progress) => engine.setVoyageProgress(progress),
        setVoyageWaypoints: (waypoints) => engine.setVoyageWaypoints(waypoints),
        waveWayfarers: () => engine.waveWayfarers(),
        setHighlightIsland: (id) => engine.setHighlightIsland(id),
        zoomBy: (factor, centerScreen) => engine.zoomBy(factor, centerScreen),
        panBy: (dx, dy) => engine.panBy(dx, dy),
        onTick: (cb) => engine.onTick(cb),
      };
      handleRef.current = handle;
      onReady?.(handle);
    });

    // ── Direct camera input: wheel zoom, drag pan, pinch zoom ────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = container.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      engine.zoomBy(factor, { x: e.clientX - r.left, y: e.clientY - r.top });
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pinchDist = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    // Tap detection: a pointer that travels < 6px total is a click, not a drag.
    let tapPointerId: number | null = null;
    let tapMoved = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        tapPointerId = e.pointerId;
        tapMoved = 0;
        canvas.style.cursor = 'grabbing';
      } else if (pointers.size === 2) {
        dragging = false;
        tapPointerId = null;
        const pts = [...pointers.values()];
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (e.pointerId === tapPointerId) {
        tapMoved += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      }
      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (pinchDist > 0) {
          const r = container.getBoundingClientRect();
          engine.zoomBy(dist / pinchDist, {
            x: (pts[0].x + pts[1].x) / 2 - r.left,
            y: (pts[0].y + pts[1].y) / 2 - r.top,
          });
        }
        pinchDist = dist;
      } else if (dragging) {
        engine.panBy(e.clientX - lastX, e.clientY - lastY);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      const wasTap =
        e.pointerId === tapPointerId &&
        tapMoved < 6 &&
        pointers.has(e.pointerId) &&
        pointers.size === 1;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (e.pointerId === tapPointerId) tapPointerId = null;
      if (pointers.size === 0) {
        dragging = false;
        canvas.style.cursor = 'grab';
      }
      if (!wasTap) return;
      // Hit-test the tap against island centers in world space.
      const layouts = layoutsRef.current;
      const clickCb = onIslandClickRef.current;
      const engine = engineRef.current;
      const containerEl = containerRef.current;
      if (!layouts || layouts.length === 0 || !clickCb || !engine || !containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      const world = screenToWorld(
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
        engine.getCamera(),
        { width: rect.width, height: rect.height },
      );
      const px = world.x * WORLD_WIDTH;
      const py = world.y * WORLD_HEIGHT;
      let best: IslandLayout | null = null;
      let bestDist = Infinity;
      for (const island of layouts) {
        const dist = Math.hypot(px - island.cx, py - island.cy);
        if (dist <= Math.max(island.rx, island.ry) * 1.2 && dist < bestDist) {
          best = island;
          bestDist = dist;
        }
      }
      if (best) clickCb(best.id);
    };
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Resize observer
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engine.resize(width, height);
        }
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      engine.destroy();
      engineRef.current = null;
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setMotionEnabled(motionEnabled);
  }, [motionEnabled]);

  return (
    <div ref={containerRef} className={className} data-world-scene>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
