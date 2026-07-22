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
  readonly onTick: (cb: (camera: { x: number; y: number; zoom: number }, night: number) => void) => () => void;
};

type PixiWorldSceneProps = {
  readonly onReady?: (handle: PixiWorldSceneHandle) => void;
  readonly motionEnabled: boolean;
  readonly className?: string;
};

export function PixiWorldScene({ onReady, motionEnabled, className }: PixiWorldSceneProps) {
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
        onTick: (cb) => engine.onTick(cb),
      };
      handleRef.current = handle;
      onReady?.(handle);
    });

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
    <div ref={containerRef} className={className} data-world-scene aria-hidden="true">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
