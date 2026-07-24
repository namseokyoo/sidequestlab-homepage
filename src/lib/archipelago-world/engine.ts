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
import { buildIslandLayouts, WORLD_HEIGHT, WORLD_WIDTH, islandFocusZoom, type IslandKind, type IslandLayout } from './islands.ts';
import { clamp } from './math.ts';
import { buildWorldPalette, type WorldPalette } from './palette.ts';
import { createIslandSystem, type IslandSystem } from './render/island.ts';
import { createParticleSystem } from './render/particles.ts';
import { createSkySystem } from './render/sky.ts';
import { createTerrainTextures, type TerrainTextures } from './render/terrain-textures.ts';
import { createWaterSystem } from './render/water.ts';
import { createBoatSystem } from './render/boats.ts';
import { createWayfarer, type WayfarerRole, type WayfarerState, type WayfarerSystem } from './render/wayfarer.ts';
import { loadArchipelagoSprites } from './render/sprite-assets.ts';

export type EngineOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
  readonly resolution?: number;
  readonly initialNight?: number;
  readonly motionEnabled?: boolean;
  /** Project ids to render as islands. Defaults to the founding fleet. */
  readonly islandIds?: readonly string[];
  /** Lifecycle state per island id (e.g. BUILDING, OPERATING). */
  readonly islandLifecycles?: Readonly<Record<string, string>>;
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
  readonly zoomBy: (factor: number, centerScreen?: { readonly x: number; readonly y: number }) => void;
  readonly panBy: (dxScreen: number, dyScreen: number) => void;
  readonly setVoyageProgress: (progress: number) => void;
  readonly setVoyageWaypoints: (waypoints: readonly VoyageWaypoint[]) => void;
  readonly setWayfarerState: (role: WayfarerRole, state: WayfarerState) => void;
  readonly waveWayfarers: () => void;
  /** Highlight one island with a glow ring; null clears all glows. */
  readonly setHighlightIsland: (id: string | null) => void;
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
  let initialized = false;
  let introStart = 0;
  const splashedIslands = new Set<string>();
  const INTRO_REVEAL_STAGGER = 380;
  const INTRO_REVEAL_MS = 750;

  const MIN_ZOOM = 0.55;
  const MAX_ZOOM = 3.5;

  const world = new Container();
  world.label = 'world';

  const sky = createSkySystem();
  const water = createWaterSystem();
  const particles = createParticleSystem();
  const boats = createBoatSystem();
  const islands: Map<IslandKind, IslandSystem> = new Map();
  const wayfarers: Map<WayfarerRole, WayfarerSystem> = new Map();
  let islandLayouts: readonly IslandLayout[] = [];

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
    initialized = true;

   terrainTextures = createTerrainTextures(app.renderer, buildWorldPalette(night));

    app.stage.addChild(world);
    world.addChild(sky.container, water.container, sky.shadowLayer, boats.container, islandLayer, wayfarerLayer, particles.container);

    // Build islands
    islandLayouts = buildIslandLayouts(options.islandIds ?? ['displaylab', 'booksalon', 'nbbang']);
    boats.setRoutes(islandLayouts);
    for (const layout of islandLayouts) {
      const lifecycle = options.islandLifecycles?.[layout.id] ?? null;
      const system = createIslandSystem(layout, lifecycle);
      islands.set(layout.id, system);
      islandLayer.addChild(system.container);
      for (const source of system.smokeSources) {
        particles.addSmokeSource(source.x, source.y);
      }
    }

    // Wayfarers stationed on the first two islands (dynamic)
    const firstIsland = islandLayouts[0] ?? null;
    const secondIsland = islandLayouts[1] ?? null;
    if (firstIsland) {
      const engineer = createWayfarer('CODE_ENGINEER', firstIsland.cx - 20, firstIsland.cy + 40, 'wayfarer-engineer');
      engineer.setState('WORKING');
      wayfarers.set('CODE_ENGINEER', engineer);
      wayfarerLayer.addChild(engineer.container);
    }
    if (secondIsland) {
      const qa = createWayfarer('QA_NAVIGATOR', secondIsland.cx + 60, secondIsland.cy + 30, 'wayfarer-qa');
      qa.setState('INSPECTING');
      wayfarers.set('QA_NAVIGATOR', qa);
      wayfarerLayer.addChild(qa.container);
    }

    // Additional smoke sources on the first and third islands
    if (firstIsland) {
      particles.addSmokeSource(firstIsland.cx + firstIsland.rx * 0.2, firstIsland.cy - firstIsland.ry * 0.4);
    }
    const thirdIsland = islandLayouts[2] ?? null;
    if (thirdIsland) {
      particles.addSmokeSource(thirdIsland.cx + thirdIsland.rx * 0.3 + 16, thirdIsland.cy + thirdIsland.ry * 0.12 - 24);
    }

    repaintAll();
    applyCamera();

    // ── Intro sequence: rise from the sea, islands reveal one by one ─
    if (motionEnabled) {
      camera = { x: 0.5, y: 0.5, zoom: 0.58 };
      applyCamera();
      introStart = performance.now();
      for (const layout of islandLayouts) {
        const system = islands.get(layout.id);
        if (system) system.container.alpha = 0;
      }
      wayfarerLayer.alpha = 0;
      tweenTo({ ...OVERVIEW_CAMERA }, 2800);
    }

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
          const home = role === 'CODE_ENGINEER' ? firstIsland : secondIsland;
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

      // Intro island reveal: each island surfaces with a gentle rise
      if (introStart > 0) {
        const elapsed = performance.now() - introStart;
        islandLayouts.forEach((layout, i) => {
          const system = islands.get(layout.id);
          if (!system) return;
          const local = clamp((elapsed - i * INTRO_REVEAL_STAGGER) / INTRO_REVEAL_MS, 0, 1);
          const eased = 1 - Math.pow(1 - local, 3);
          system.container.alpha = eased;
          system.container.y = (1 - eased) * 36;
          // Water-splash burst the moment the island breaks the surface
          if (local > 0 && !splashedIslands.has(layout.id)) {
            splashedIslands.add(layout.id);
            particles.burstSplash(layout.cx, layout.cy + layout.ry * 0.82, 12 + Math.floor(layout.rx / 30));
            particles.burstSplash(layout.cx - layout.rx * 0.55, layout.cy + layout.ry * 0.6, 6);
            particles.burstSplash(layout.cx + layout.rx * 0.55, layout.cy + layout.ry * 0.6, 6);
            if (layout.companion) {
              particles.burstSplash(layout.companion.cx, layout.companion.cy + layout.companion.ry * 0.82, 8);
            }
          }
        });
        const wfLocal = clamp((elapsed - islandLayouts.length * INTRO_REVEAL_STAGGER) / INTRO_REVEAL_MS, 0, 1);
        wayfarerLayer.alpha = wfLocal;
        if (elapsed > islandLayouts.length * INTRO_REVEAL_STAGGER + INTRO_REVEAL_MS + 200) {
          introStart = 0;
          splashedIslands.clear();
          for (const layout of islandLayouts) {
            const system = islands.get(layout.id);
            if (system) {
              system.container.alpha = 1;
              system.container.y = 0;
            }
          }
          wayfarerLayer.alpha = 1;
        }
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
      boats.tick(timeMs, deltaMs, motionEnabled);

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
    boats.repaint(palette);
    for (const system of islands.values()) {
      system.repaint(palette, night, terrainTextures ?? undefined);
    }
    for (const w of wayfarers.values()) {
      w.repaint(palette, night);
    }
  }

  function applyCamera(): void {
    camera = clampCamera(camera);
    const scale = camera.zoom;
    world.scale.set(scale, scale);
    const viewW = viewportW / scale;
    const viewH = viewportH / scale;
    world.x = -(camera.x * WORLD_WIDTH - viewW / 2) * scale;
    world.y = -(camera.y * WORLD_HEIGHT - viewH / 2) * scale;
  }

  /** Keep the viewport inside world bounds and zoom within limits. */
  function clampCamera(cam: CameraState): CameraState {
    const zoom = clamp(cam.zoom, MIN_ZOOM, MAX_ZOOM);
    const viewW = viewportW / zoom;
    const viewH = viewportH / zoom;
    const minX = viewW >= WORLD_WIDTH ? 0.5 : viewW / (2 * WORLD_WIDTH);
    const maxX = viewW >= WORLD_WIDTH ? 0.5 : 1 - viewW / (2 * WORLD_WIDTH);
    const minY = viewH >= WORLD_HEIGHT ? 0.5 : viewH / (2 * WORLD_HEIGHT);
    const maxY = viewH >= WORLD_HEIGHT ? 0.5 : 1 - viewH / (2 * WORLD_HEIGHT);
    return { x: clamp(cam.x, minX, maxX), y: clamp(cam.y, minY, maxY), zoom };
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
      boats.dispose();
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
      if (initialized) {
        app.renderer.resize(width, height);
      }
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
      const layout = islandLayouts.find((l) => l.id === id);
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

    zoomBy(factor: number, centerScreen?: { readonly x: number; readonly y: number }): void {
      if (destroyed) return;
      cameraTweening = false;
      const prev = clampCamera(camera);
      const zoom = clamp(prev.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (centerScreen) {
        // Keep the world point under the cursor fixed while zooming
        const wx = prev.x * WORLD_WIDTH + (centerScreen.x - viewportW / 2) / prev.zoom;
        const wy = prev.y * WORLD_HEIGHT + (centerScreen.y - viewportH / 2) / prev.zoom;
        camera = clampCamera({
          x: (wx - (centerScreen.x - viewportW / 2) / zoom) / WORLD_WIDTH,
          y: (wy - (centerScreen.y - viewportH / 2) / zoom) / WORLD_HEIGHT,
          zoom,
        });
      } else {
        camera = clampCamera({ ...prev, zoom });
      }
      applyCamera();
    },

    panBy(dxScreen: number, dyScreen: number): void {
      if (destroyed) return;
      cameraTweening = false;
      const prev = clampCamera(camera);
      camera = clampCamera({
        x: prev.x - dxScreen / (prev.zoom * WORLD_WIDTH),
        y: prev.y - dyScreen / (prev.zoom * WORLD_HEIGHT),
        zoom: prev.zoom,
      });
      applyCamera();
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

    setHighlightIsland(id: string | null): void {
      for (const [islandId, system] of islands) {
        system.setGlow(id !== null && islandId === id);
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
