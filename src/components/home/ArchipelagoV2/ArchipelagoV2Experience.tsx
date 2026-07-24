'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import type { ArchipelagoView } from '../Archipelago/types';
import { worldToScreen } from '@/lib/archipelago-world/camera';
import { buildIslandLayouts, CLIFF_HEIGHT, WORLD_HEIGHT, WORLD_WIDTH, type IslandKind, type IslandLayout, type IslandTier } from '@/lib/archipelago-world/islands';
import type { FocusBox } from '@/lib/archipelago-world/camera';

import { DayNightDial } from './DayNightDial';
import { HarborLog, type HarborLogEntry } from './HarborLog';
import { PixiWorldScene, type PixiWorldSceneHandle } from './PixiWorldScene';
import { ProjectOverlay } from './ProjectOverlay';
import { getArchipelagoV2Copy } from './copy';
import styles from './V2.module.css';

type ArchipelagoV2ExperienceProps = {
  readonly view: ArchipelagoView;
};

type IslandLabel = {
  readonly projectId: string;
  readonly name: string;
  readonly lifecycle: string;
  readonly lifecycleLabel: string;
  readonly progressPercent: number;
  readonly tier: IslandTier;
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
};

/**
 * Derive the camera focus box from the live island layout rather than
 * the presentation manifest, so focus targets always match the actual
 * world geometry (including companion landmasses and cliff faces).
 */
function layoutToFocusBox(layout: IslandLayout, scaleCap: number): FocusBox {
  const pad = 60;
  const west = layout.cx - layout.rx;
  const east = layout.companion
    ? Math.max(layout.cx + layout.rx, layout.companion.cx + layout.companion.rx)
    : layout.cx + layout.rx;
  const north = layout.cy - layout.ry;
  const south = Math.max(
    layout.cy + layout.ry,
    layout.companion ? layout.companion.cy + layout.companion.ry : 0,
  );
  return {
    x: (west - pad) / WORLD_WIDTH,
    y: (north - pad) / WORLD_HEIGHT,
    width: (east - west + pad * 2) / WORLD_WIDTH,
    height: (south - north + pad * 2 + CLIFF_HEIGHT) / WORLD_HEIGHT,
    scaleCap,
  };
}

// ── Project-card overlap avoidance ─────────────────────────────────────────
// Cards are DOM elements anchored at bottom-center (CSS translate(-50%,-100%)).
// At low zoom, nearby islands project their cards onto overlapping screen
// regions, so overlapping pairs are pushed apart along the axis of minimum
// penetration before the labels are committed to state.
const CARD_W = 134;
const CARD_H = 80;
const CARD_GAP = 6;

type CardRect = { x: number; y: number; w: number; h: number };

/** Iteratively push overlapping cards apart. Cards are anchored at bottom-center. */
function resolveCardOverlaps(
  positions: { x: number; y: number }[],
  visible: boolean[],
  cardW: number,
  cardH: number,
  viewport: { width: number; height: number },
  iterations = 20,
): { x: number; y: number }[] {
  // Work on a mutable copy; callers keep their input arrays intact.
  const pos = positions.map((p) => ({ ...p }));
  const n = pos.length;
  const halfW = cardW / 2;

  const rectAt = (p: { x: number; y: number }): CardRect => ({
    x: p.x - halfW,
    y: p.y - cardH,
    w: cardW,
    h: cardH,
  });
  const clampX = (x: number) => Math.min(Math.max(x, halfW), viewport.width - halfW);
  const clampY = (y: number) => Math.min(Math.max(y, cardH), viewport.height);
  // A card already flush against a viewport edge cannot move further that way;
  // its counterpart then absorbs the whole displacement.
  const pinnedX = (p: { x: number; y: number }) => p.x - halfW <= 0 || p.x + halfW >= viewport.width;
  const pinnedY = (p: { x: number; y: number }) => p.y - cardH <= 0 || p.y >= viewport.height;

  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < n; i += 1) {
      if (!visible[i]) continue;
      for (let j = i + 1; j < n; j += 1) {
        if (!visible[j]) continue;
        const a = rectAt(pos[i]);
        const b = rectAt(pos[j]);
        // Penetration depth per axis, inflated by the required gap.
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + CARD_GAP;
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + CARD_GAP;
        if (overlapX <= 0 || overlapY <= 0) continue;

        if (overlapX <= overlapY) {
          // Push apart horizontally: i toward the left, j toward the right
          // (sign flips when i sits to the right of j).
          const sign = pos[i].x <= pos[j].x ? -1 : 1;
          const iShare = pinnedX(pos[i]) ? 0 : pinnedX(pos[j]) ? 1 : 0.5;
          pos[i].x += sign * overlapX * iShare;
          pos[j].x -= sign * overlapX * (1 - iShare);
        } else {
          // Push apart vertically: i upward, j downward (sign flips likewise).
          const sign = pos[i].y <= pos[j].y ? -1 : 1;
          const iShare = pinnedY(pos[i]) ? 0 : pinnedY(pos[j]) ? 1 : 0.5;
          pos[i].y += sign * overlapY * iShare;
          pos[j].y -= sign * overlapY * (1 - iShare);
        }
        moved = true;
      }
    }
    // Keep every card fully inside the viewport before the next pass.
    for (let k = 0; k < n; k += 1) {
      if (!visible[k]) continue;
      pos[k].x = clampX(pos[k].x);
      pos[k].y = clampY(pos[k].y);
    }
    if (!moved) break; // Stable — no overlapping pairs left.
  }

  return pos;
}

export function ArchipelagoV2Experience({ view }: ArchipelagoV2ExperienceProps) {
  const copy = getArchipelagoV2Copy(view.locale);
  const islandIds = useMemo(() => view.projects.map((p) => p.id), [view.projects]);
  const islandLayouts = useMemo(() => buildIslandLayouts(islandIds), [islandIds]);
  const islandLifecycles = useMemo(
    () => Object.fromEntries(view.projects.map((p) => [p.id, p.lifecycle])),
    [view.projects],
  );
  const [handle, setHandle] = useState<PixiWorldSceneHandle | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Island click → pulse the matching card briefly (1.2s).
  useEffect(() => {
    if (!pulsingId) return;
    pulseTimerRef.current = setTimeout(() => {
      setPulsingId(null);
      pulseTimerRef.current = null;
    }, 1200);
    return () => {
      if (pulseTimerRef.current) {
        clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [pulsingId]);

  const handleIslandClick = useCallback((islandId: string) => {
    setSelectedId(islandId);
    setPulsingId(islandId);
  }, []);

  const [night, setNight] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
  // Save-Data: disable particles + reduce sprite animations
  const saveData = useSyncExternalStore(
    (onStoreChange) => {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean; addEventListener?: (e: string, cb: () => void) => void; removeEventListener?: (e: string, cb: () => void) => void } }).connection;
      if (!conn?.addEventListener) return () => {};
      conn.addEventListener('change', onStoreChange);
      return () => conn.removeEventListener?.('change', onStoreChange);
    },
    () => Boolean((navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData),
    () => false,
  );
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const motionEnabled = saveData ? false : (motionOverride ?? !prefersReducedMotion);
  const [labels, setLabels] = useState<readonly IslandLabel[]>([]);
  const [viewport, setViewport] = useState({ width: 1200, height: 700 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track viewport size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
        // Invalidate the cached camera so labels recompute against the
        // fresh viewport on the next tick (the tick callback skips work
        // while the camera is stationary).
        lastLabelCamera.current = null;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Camera tick → update DOM label positions
  const lastLabelCamera = useRef<{ x: number; y: number; zoom: number } | null>(null);
  useEffect(() => {
    if (!handle) return;
    // Viewport (or handle/projects) changed — force a label recompute on
    // the next tick even though the camera has not moved.
    lastLabelCamera.current = null;
    return handle.onTick((camera) => {
      // Skip when the camera is stationary — label positions only change
      // with camera movement, so idle frames need no recomputation.
      const prev = lastLabelCamera.current;
      if (prev && prev.x === camera.x && prev.y === camera.y && prev.zoom === camera.zoom) return;
      lastLabelCamera.current = { x: camera.x, y: camera.y, zoom: camera.zoom };
      const next: IslandLabel[] = view.projects.map((project) => {
        const layout = islandLayouts.find((l) => l.id === project.id);
        if (!layout) {
          return { projectId: project.id, name: project.name, lifecycle: project.lifecycle, lifecycleLabel: '', progressPercent: project.progressPercent, tier: 'standard' as IslandTier, x: -999, y: -999, visible: false };
        }
        const screen = worldToScreen(
          { x: layout.cx / WORLD_WIDTH, y: (layout.cy - layout.ry - 30) / WORLD_HEIGHT },
          camera,
          viewport,
        );
        const inView =
          screen.x > -100 && screen.x < viewport.width + 100 &&
          screen.y > -60 && screen.y < viewport.height + 60;
        return {
          projectId: project.id,
          name: project.name,
          lifecycle: project.lifecycle,
          lifecycleLabel: copy.projectStates[project.lifecycle] ?? project.lifecycle,
          progressPercent: project.progressPercent,
          tier: layout.tier,
          x: screen.x,
          y: screen.y,
          visible: inView && camera.zoom < 2.2,
        };
      });
      // Push overlapping cards apart so nearby islands never stack at low zoom.
      const adjusted = resolveCardOverlaps(
        next.map((label) => ({ x: label.x, y: label.y })),
        next.map((label) => label.visible),
        CARD_W,
        CARD_H,
        viewport,
      );
      // Only visible cards move; invisible labels keep x:-999, y:-999.
      const resolved = next.map((label, i) =>
        label.visible ? { ...label, x: adjusted[i].x, y: adjusted[i].y } : label,
      );
      setLabels(resolved);
    });
  }, [handle, view.projects, viewport, islandLayouts]);

  const selectProject = useCallback((projectId: string) => {
    const project = view.projects.find((p) => p.id === projectId);
    const layout = islandLayouts.find((l) => l.id === projectId);
    if (!project || !layout || !handle) return;
    setSelectedId(projectId);
    handle.focusIsland(project.id as IslandKind, layoutToFocusBox(layout, project.presentation.focusScaleCap));
  }, [handle, view.projects, islandLayouts]);

  const returnToOverview = useCallback(() => {
    setSelectedId(null);
    handle?.showOverview();
  }, [handle]);

  const changeNight = useCallback((value: number) => {
    setNight(value);
    handle?.setNight(value);
  }, [handle]);

  // Harbor log entries from view data
  const logEntries: readonly HarborLogEntry[] = useMemo(() => {
    return view.projects.map((project) => ({
      projectId: project.id,
      projectName: project.name,
      action: copy.logActions[project.lifecycle] ?? project.lifecycle,
      timestamp: project.updatedAtLabel,
      lifecycle: project.lifecycle,
      version: project.version,
    }));
  }, [view.projects, copy.logActions]);

  const selectedProject = selectedId
    ? view.projects.find((p) => p.id === selectedId) ?? null
    : null;

  return (
    <div className={styles.v2Root} data-night={night > 0.5}>
      {/* ── World stage ─────────────────────────────────────────── */}
      <div className={styles.worldStage} ref={containerRef}>
        <PixiWorldScene
          onReady={setHandle}
          motionEnabled={motionEnabled}
          islandIds={islandIds}
          islandLifecycles={islandLifecycles}
          islandLayouts={islandLayouts}
          onIslandClick={handleIslandClick}
          className={styles.worldCanvas}
        />

        {/* Identity block — top left, over the world */}
        <header className={styles.worldHeader}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 className={styles.worldTitle}>{copy.title}</h1>
          <p className={styles.worldIntro}>{copy.intro}</p>
        </header>

        {/* Day/night dial — top right */}
        <div className={styles.dialPosition}>
          <DayNightDial
            night={night}
            onChange={changeNight}
            dayLabel={copy.dayLabel}
            nightLabel={copy.nightLabel}
          />
          <button
            type="button"
            className={styles.motionToggle}
            onClick={() => setMotionOverride(!motionEnabled)}
            aria-pressed={motionEnabled}
          >
            {motionEnabled ? '⏸' : '▶'}
          </button>
        </div>

        {/* Camera controls — bottom right */}
        <div className={styles.zoomCluster}>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => handle?.zoomBy(1.35)}
            aria-label={copy.zoomIn}
          >
            +
          </button>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => handle?.zoomBy(1 / 1.35)}
            aria-label={copy.zoomOut}
          >
            −
          </button>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={returnToOverview}
            aria-label={copy.resetView}
          >
            ⌂
          </button>
        </div>

        {/* Island name labels (DOM overlay, keyboard accessible) */}
        <div className={styles.islandLabels}>
          {labels.map((label) =>
            label.visible ? (
              <div
                key={label.projectId}
                className={`${styles.islandCard} ${label.tier === 'flagship' ? styles.islandCardFlagship : label.tier === 'core' ? styles.islandCardCore : ''}${label.projectId === pulsingId || label.projectId === selectedId ? ` ${styles.islandCardActive}` : ''}`}
                data-selected={label.projectId === selectedId}
                data-lifecycle={label.lifecycle}
                data-tier={label.tier}
                style={{ left: label.x, top: label.y }}
                onMouseEnter={() => handle?.setHighlightIsland(label.projectId)}
                onMouseLeave={() => handle?.setHighlightIsland(null)}
              >
                <button
                  type="button"
                  className={styles.islandCardBtn}
                  onClick={() => selectProject(label.projectId)}
                  aria-pressed={label.projectId === selectedId}
                >
                  <span className={styles.islandCardName}>{label.name}</span>
                  <span className={styles.islandCardBadge} data-lifecycle={label.lifecycle}>
                    {label.lifecycleLabel}
                  </span>
                  <span className={styles.islandCardProgress}>
                    <span
                      className={styles.islandCardProgressFill}
                      style={{ width: `${label.progressPercent}%` }}
                    />
                  </span>
                </button>
              </div>
            ) : null,
          )}
        </div>

        {/* Project detail overlay */}
        {selectedProject ? (
          <ProjectOverlay
            project={{
              id: selectedProject.id,
              name: selectedProject.name,
              summary: selectedProject.summary,
              lifecycleLabel: copy.projectStates[selectedProject.lifecycle] ?? selectedProject.lifecycle,
              progressPercent: selectedProject.progressPercent,
              version: selectedProject.version,
              updatedAtLabel: selectedProject.updatedAtLabel,
              outcome: selectedProject.outcome,
              detailHref: selectedProject.detailHref,
              liveHref: selectedProject.liveHref,
              evidenceHref: selectedProject.evidenceHref,
            }}
            labels={{
              selected: copy.selected,
              lifecycle: copy.lifecycle,
              progress: copy.progress,
              version: copy.version,
              updated: copy.updated,
              outcome: copy.outcome,
              details: copy.details,
              visit: copy.visit,
              evidence: copy.evidence,
              unavailableLive: copy.unavailableLive,
              unavailableEvidence: copy.unavailableEvidence,
              overview: copy.overview,
            }}
            onOverview={returnToOverview}
          />
        ) : null}

        {/* Screen-reader scene description */}
        <p className="sr-only">{copy.sceneDescription}</p>
      </div>

      {/* ── Harbor Log ──────────────────────────────────────────── */}
      <HarborLog
        entries={logEntries}
        title={copy.harborLogTitle}
        subtitle={copy.harborLogSubtitle}
        onSelectProject={selectProject}
        selectedProjectId={selectedId}
      />

      {/* ── Semantic project list (accessibility, no-JS fallback) ── */}
      <nav className={styles.semanticList} aria-label={copy.choose}>
        <ul>
          {view.projects.map((project) => (
            <li key={project.id}>
              <a href={project.detailHref}>
                {project.name} — {copy.projectStates[project.lifecycle] ?? project.lifecycle},{' '}
                {project.progressPercent}%
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
