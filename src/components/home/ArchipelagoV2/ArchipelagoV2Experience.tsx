'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import type { ArchipelagoView } from '../Archipelago/types';
import { worldToScreen } from '@/lib/archipelago-world/camera';
import { buildIslandLayouts, WORLD_HEIGHT, WORLD_WIDTH, type IslandKind } from '@/lib/archipelago-world/islands';
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
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
};

function toFocusBox(project: ArchipelagoView['projects'][number]): FocusBox {
  return {
    x: project.presentation.focusBox.x,
    y: project.presentation.focusBox.y,
    width: project.presentation.focusBox.width,
    height: project.presentation.focusBox.height,
    scaleCap: project.presentation.focusScaleCap,
  };
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
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Camera tick → update DOM label positions
  useEffect(() => {
    if (!handle) return;
    return handle.onTick((camera) => {
      const next: IslandLabel[] = view.projects.map((project) => {
        const layout = islandLayouts.find((l) => l.id === project.id);
        if (!layout) {
          return { projectId: project.id, name: project.name, lifecycle: project.lifecycle, lifecycleLabel: '', progressPercent: project.progressPercent, x: -999, y: -999, visible: false };
        }
        const screen = worldToScreen(
          { x: layout.cx / WORLD_WIDTH, y: (layout.cy - layout.ry - 30) / WORLD_HEIGHT },
          camera,
          { width: WORLD_WIDTH, height: WORLD_HEIGHT },
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
          x: screen.x,
          y: screen.y,
          visible: inView && camera.zoom < 2.2,
        };
      });
      setLabels(next);
    });
  }, [handle, view.projects, viewport, islandLayouts]);

  const selectProject = useCallback((projectId: string) => {
    const project = view.projects.find((p) => p.id === projectId);
    if (!project || !handle) return;
    setSelectedId(projectId);
    handle.focusIsland(project.id as IslandKind, toFocusBox(project));
  }, [handle, view.projects]);

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
                className={styles.islandCard}
                data-selected={label.projectId === selectedId}
                data-lifecycle={label.lifecycle}
                style={{ left: label.x, top: label.y }}
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
