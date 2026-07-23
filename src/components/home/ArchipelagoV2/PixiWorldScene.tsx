'use client';

import { useEffect, useRef } from 'react';

import { createWorldEngine, type WorldEngine } from '@/lib/archipelago-world/engine';
import type { IslandKind } from '@/lib/archipelago-world/islands';
import type { FocusBox } from '@/lib/archipelago-world/camera';

export type PixiWorldSceneHandle = {
  readonly focusIsland: (id: IslandKind, focusBox: FocusBox) => void;
  readonly showOverview: () => void;
  readonly setNight: (night: number) => void;
  readonly setVoyageProgress: (progress: number) => void;
  readonly setVoyageWaypoints: (waypoints: readonly { x: number; y: number; projectId: string | null }[]) => void;
  readonly waveWayfarers: () => void;
  readonly zoomBy: (factor: number, centerScreen?: { x: number; y: number }) => void;
  readonly panBy: (dxScreen: number, dyScreen: number) => void;
  readonly onTick: (cb: (camera: { x: number; y: number; zoom: number }, night: number) => void) => () => void;
};

type PixiWorldSceneProps = {
  readonly onReady?: (handle: PixiWorldSceneHandle) => void;
  readonly motionEnabled: boolean;
  readonly islandIds?: readonly string[];
  readonly islandLifecycles?: Readonly<Record<string, string>>;
  readonly className?: string;
};

export function PixiWorldScene({ onReady, motionEnabled, islandIds, islandLifecycles, className }: PixiWorldSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);
  const motionRef = useRef(motionEnabled);
  motionRef.current = motionEnabled;

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

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
      } else if (pointers.size === 2) {
        dragging = false;
        const pts = [...pointers.values()];
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
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
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) {
        dragging = false;
        canvas.style.cursor = 'grab';
      }
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
