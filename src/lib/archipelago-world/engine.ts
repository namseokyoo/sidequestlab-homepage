/**
 * Living Archipelago WorldEngine — orchestrates all render systems
 * inside a single PixiJS Application.
 *
 * Responsibilities:
 * - Day/night cycle driven by a normalized `night` value (0–1)
 * - Camera state machine (overview ↔ focus, mobile voyage)
 * - System tick dispatch with motion gating
 * - Repaint on palette change
 */

import { Application, Container } from 'pixi.js';

import {
  FOCUS_TRANSITION_MS,
  OVERVIEW_CAMERA,
  focusCameraTarget,
  tweenCamera,
  voyageCameraAt,
  type CameraState,
  type FocusBox,
  type VoyageWaypoint,
} from './camera.ts';
import { ISLAND_LAYOUTS, WORLD_HEIGHT, WORLD_WIDTH, islandFocusZoom, type IslandKind } from './islands.ts';
import { buildWorldPalette, type WorldPalette } from './palette.ts';
import { createIslandSystem, type IslandSystem } from './render/island.ts';
import { createParticleSystem } from './render/particles.ts';
import { createSkySystem } from './render/sky.ts';
import { createTerrainTextures, type TerrainTextures } from './render/terrain-textures.ts';
import { createWaterSystem } from './render/water.ts';
import { createWayfarer, type WayfarerRole, type WayfarerState, type WayfarerSystem } from './render/wayfarer.ts';
import { loadArchipelagoSprites } from './render/sprite-assets.ts';

export type EngineOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
  readonly resolution?: number;
  readonly initialNight?: number;
  readonly motionEnabled?: boolean;
};

export type WorldEngine = {
  readonly app: Application;
  readonly destroy: () => void;
  readonly resize: (width: number, height: number) => void;
  readonly setNight: (night: number) => void;
  readonly getNight: () => number;
  readonly setMotionEnabled: (enabled: boolean) => void;
  readonly focusIsland: (id: IslandKind, focusBox: FocusBox) => void;
  readonly showOverview: () => void;
  readonly setVoyageProgress: (progress: number) => void;
  readonly setVoyageWaypoints: (waypoints: readonly VoyageWaypoint[]) => void;
  readonly setWayfarerState: (role: WayfarerRole, state: WayfarerState) => void;
  readonly waveWayfarers: () => void;
  readonly burstAt: (x: number, y: number) => void;
  readonly getCamera: () => CameraState;
  readonly getViewport: () => { width: number; height: number };
  readonly onTick: (callback: (camera: CameraState, night: number) => void) => () => void;
  readonly ready: Promise<void>;
};

export function createWorldEngine(options: EngineOptions): WorldEngine {
  const app = new Application();
  let destroyed = false;
  let viewportW = options.width;
  let viewportH = options.height;
  let night = options.initialNight ?? 0;
  let motionEnabled = options.motionEnabled ?? true;
  let camera: CameraState = { ...OVERVIEW_CAMERA };
  let cameraFrom: CameraState = { ...OVERVIEW_CAMERA };
  let cameraTo: CameraState = { ...OVERVIEW_CAMERA };
  let cameraTweenStart = 0;
  let cameraTweenDuration = 0;
  let cameraTweening = false;
  let voyageWaypoints: readonly VoyageWaypoint[] = [];
  const tickCallbacks: ((camera: CameraState, night: number) => void)[] = [];
  let terrainTextures: TerrainTextures | null = null;

  const world = new Container();
  world.label = 'world';

  const sky = createSkySystem();
  const water = createWaterSystem();
  const particles = createParticleSystem();
  const islands: Map<IslandKind, IslandSystem> = new Map();
  const wayfarers: Map<WayfarerRole, WayfarerSystem> = new Map();

  // Layer order: sky backdrop → water → cloud shadows → islands → particles → sky overlay (clouds/gulls)
  const islandLayer = new Container();
  islandLayer.label = 'islands';
  const wayfarerLayer = new Container();
  wayfarerLayer.label = 'wayfarers';

  const ready = app.init({
    canvas: options.canvas,
    width: options.width,
    height: options.height,
    resolution: options.resolution ?? Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: 0x257e83,
    antialias: true,
    autoDensity: true,
  }).then(() => {
    if (destroyed) return;

    terrainTextures = createTerrainTextures(app.renderer, buildWorldPalette(night));

    app.stage.addChild(world);
    world.addChild(sky.container, water.container, sky.shadowLayer, islandLayer, wayfarerLayer, particles.container);

    // Build islands
    for (const layout of ISLAND_LAYOUTS) {
      const system = createIslandSystem(layout);
      islands.set(layout.id, system);
      islandLayer.addChild(system.container);
      for (const source of system.smokeSources) {
        particles.addSmokeSource(source.x, source.y);
      }
    }

    // Wayfarers stationed on their home islands
    const displaylab = ISLAND_LAYOUTS.find((l) => l.id === 'displaylab');
    const booksalon = ISLAND_LAYOUTS.find((l) => l.id === 'booksalon');
    const nbbang = ISLAND_LAYOUTS.find((l) => l.id === 'nbbang');
    if (displaylab) {
      const engineer = createWayfarer('CODE_ENGINEER', displaylab.cx - 20, displaylab.cy + 40, 'wayfarer-engineer');
      engineer.setState('WORKING');
      wayfarers.set('CODE_ENGINEER', engineer);
      wayfarerLayer.addChild(engineer.container);
    }
    if (booksalon) {
      const qa = createWayfarer('QA_NAVIGATOR', booksalon.cx + 60, booksalon.cy + 30, 'wayfarer-qa');
      qa.setState('INSPECTING');
      wayfarers.set('QA_NAVIGATOR', qa);
      wayfarerLayer.addChild(qa.container);
    }

    // Additional smoke sources (3 total: displaylab chimney, nbbang house, booksalon)
    if (displaylab) {
      particles.addSmokeSource(displaylab.cx + displaylab.rx * 0.2, displaylab.cy - displaylab.ry * 0.4);
    }
    if (nbbang) {
      particles.addSmokeSource(nbbang.cx + nbbang.rx * 0.3 + 16, nbbang.cy + nbbang.ry * 0.12 - 24);
    }

    repaintAll();
    applyCamera();

    // Load AI sprites in the background — procedural art is already
    // visible; sprites swap in as each texture arrives.
    void loadArchipelagoSprites().then((loaded) => {
      if (destroyed || loaded === 0) return;
      // Repaint islands so landmark sprites attach to fresh layers
      repaintAll();
    });

    // Main loop
    let lastWalkTrigger = 0;
    app.ticker.add((ticker) => {
      if (destroyed) return;
      const timeMs = ticker.lastTime;
      const deltaMs = ticker.deltaMS;

      // Periodic walk trigger: every 30s, wayfarers walk for 10s
      if (motionEnabled && timeMs - lastWalkTrigger > 30000) {
        lastWalkTrigger = timeMs;
        for (const [role, w] of wayfarers) {
          const home = role === 'CODE_ENGINEER' ? displaylab : booksalon;
          if (home) {
            const angle = Math.random() * Math.PI * 2;
            const tx = home.cx + Math.cos(angle) * 40;
            const ty = home.cy + Math.sin(angle) * 30;
            w.moveTo(tx, ty, 10000);
          }
        }
      }

      // Camera tween
      if (cameraTweening) {
        const t = Math.min(1, (performance.now() - cameraTweenStart) / cameraTweenDuration);
        camera = tweenCamera(cameraFrom, cameraTo, t);
        if (t >= 1) cameraTweening = false;
        applyCamera();
      }

      sky.tick(timeMs, deltaMs, motionEnabled);
      water.tick(timeMs, deltaMs, motionEnabled);
      for (const system of islands.values()) {
        system.tick(timeMs, deltaMs, motionEnabled, night);
      }
      for (const w of wayfarers.values()) {
        w.tick(timeMs, deltaMs, motionEnabled);
      }
      particles.tick(timeMs, deltaMs, motionEnabled, night);

      for (const cb of tickCallbacks) {
        cb(camera, night);
      }
    });
  });

  function repaintAll(): void {
    const palette: WorldPalette = buildWorldPalette(night);
    sky.repaint(palette, night);
    water.repaint(palette, night);
    particles.repaint(palette);
    for (const system of islands.values()) {
      system.repaint(palette, night, terrainTextures ?? undefined);
    }
    for (const w of wayfarers.values()) {
      w.repaint(palette, night);
    }
  }

  function applyCamera(): void {
    const scale = camera.zoom;
    world.scale.set(scale, scale);
    const viewW = viewportW / scale;
    const viewH = viewportH / scale;
    world.x = -(camera.x * WORLD_WIDTH - viewW / 2) * scale;
    world.y = -(camera.y * WORLD_HEIGHT - viewH / 2) * scale;
  }

  function tweenTo(target: CameraState, durationMs: number): void {
    cameraFrom = { ...camera };
    cameraTo = target;
    cameraTweenStart = performance.now();
    cameraTweenDuration = motionEnabled ? durationMs : 1;
    cameraTweening = true;
  }

  let lastNightBucket = -1;

  return {
    app,
    ready,

    destroy(): void {
      destroyed = true;
      tickCallbacks.length = 0;
      for (const system of islands.values()) {
        system.dispose?.();
      }
      for (const w of wayfarers.values()) {
        w.dispose?.();
      }
      terrainTextures?.destroy();
      terrainTextures = null;
      app.destroy(true, { children: true, texture: true });
    },

    resize(width: number, height: number): void {
      if (destroyed) return;
      viewportW = width;
      viewportH = height;
      app.renderer.resize(width, height);
      applyCamera();
    },

    setNight(next: number): void {
      const clamped = Math.max(0, Math.min(1, next));
      // Only repaint when the night bucket changes meaningfully
      const bucket = Math.round(clamped * 20);
      if (bucket === lastNightBucket) {
        night = clamped;
        return;
      }
      lastNightBucket = bucket;
      night = clamped;
      if (terrainTextures && !destroyed) {
        terrainTextures.destroy();
        terrainTextures = createTerrainTextures(app.renderer, buildWorldPalette(night));
      }
      repaintAll();
    },

    getNight: () => night,

    setMotionEnabled(enabled: boolean): void {
      motionEnabled = enabled;
    },

    focusIsland(id: IslandKind, focusBox: FocusBox): void {
      const layout = ISLAND_LAYOUTS.find((l) => l.id === id);
      const islandCap = layout
        ? islandFocusZoom(layout, { width: viewportW, height: viewportH })
        : focusBox.scaleCap;
      const target = focusCameraTarget(
        { ...focusBox, scaleCap: Math.min(focusBox.scaleCap, islandCap) },
        { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      );
      tweenTo(target, FOCUS_TRANSITION_MS);
      // Wayfarers wave when their island is selected
      if (layout) {
        for (const w of wayfarers.values()) {
          const pos = w.position();
          const dist = Math.hypot(pos.x - layout.cx, pos.y - layout.cy);
          if (dist < Math.max(layout.rx, layout.ry) * 1.3) {
            w.setState('WAVING');
          }
        }
      }
    },

    showOverview(): void {
      tweenTo({ ...OVERVIEW_CAMERA }, FOCUS_TRANSITION_MS);
    },

    setVoyageWaypoints(waypoints: readonly VoyageWaypoint[]): void {
      voyageWaypoints = waypoints;
    },

    setVoyageProgress(progress: number): void {
      camera = voyageCameraAt(voyageWaypoints, progress);
      applyCamera();
    },

    setWayfarerState(role: WayfarerRole, state: WayfarerState): void {
      wayfarers.get(role)?.setState(state);
    },

    waveWayfarers(): void {
      for (const w of wayfarers.values()) {
        w.setState('WAVING');
      }
    },

    burstAt(x: number, y: number): void {
      particles.burstSparkles(x, y, 24);
    },

    getCamera: () => ({ ...camera }),

    getViewport: () => ({ width: viewportW, height: viewportH }),

    onTick(callback: (camera: CameraState, night: number) => void): () => void {
      tickCallbacks.push(callback);
      return () => {
        const index = tickCallbacks.indexOf(callback);
        if (index >= 0) tickCallbacks.splice(index, 1);
      };
    },
  };
}
