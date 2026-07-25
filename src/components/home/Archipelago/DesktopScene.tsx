'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { ArchipelagoInteractionState } from '@/lib/archipelago/interaction-state';
import type { FleetGuideRole, FleetProjectionFreshness } from '@/lib/archipelago/model';
import type { DataTransferMode, MotionMode } from '@/lib/archipelago/motion-policy';
import { isSceneMotionAllowed } from '@/lib/archipelago/motion-policy';

import { WayfarerParty } from './WayfarerParty';
import type { ArchipelagoCopy } from './copy';
import type { SimulatorState } from './state';
import type { ArchipelagoProject } from './types';
import { useSceneVisibility } from './useSceneVisibility';
import styles from './Scene.module.css';

type DesktopSceneProps = {
  readonly copy: ArchipelagoCopy;
  readonly projects: readonly ArchipelagoProject[];
  readonly selected: ArchipelagoProject;
  readonly interaction: ArchipelagoInteractionState;
  readonly freshness: FleetProjectionFreshness;
  readonly motionMode: MotionMode;
  readonly simulatorState: SimulatorState | null;
  readonly documentVisible: boolean;
  readonly dataTransferMode: DataTransferMode;
  readonly prefersReducedMotion: boolean;
  readonly onSelect: (projectId: string) => void;
  readonly onOverview: () => void;
  readonly onOpenGuide: (role: FleetGuideRole, trigger: HTMLButtonElement) => void;
  readonly onVisibilityChange: (visible: boolean) => void;
};

export function DesktopScene(props: DesktopSceneProps) {
  const [overviewSource, setOverviewSource] = useState(
    '/images/archipelago/archipelago-scene-v3-projects.png',
  );
  const [failedFocusId, setFailedFocusId] = useState<string | null>(null);
  const [loadedFocusId, setLoadedFocusId] = useState<string | null>(null);
  const isOverview = props.interaction.camera.phase === 'OVERVIEW';
  const focusSource = `/images/archipelago/dioramas/${props.selected.id}-focus-v1.png`;
  const focusFailed = failedFocusId === props.selected.id;
  const focusLoaded = loadedFocusId === props.selected.id;
  // Keep the overview artwork on screen until the focus diorama has decoded
  // (or failed), so selecting an island never flashes the bare background.
  const showOverview = isOverview || (!focusLoaded && !focusFailed);
  const cameraRevision = props.interaction.camera.revision;
  const { onVisibilityChange } = props;
  const { sceneRef, sceneVisible } = useSceneVisibility<HTMLElement>();
  const sceneMotionAllowed = isSceneMotionAllowed({
    freshness: props.freshness,
    motionMode: props.motionMode,
    prefersReducedMotion: props.prefersReducedMotion,
    dataTransferMode: props.dataTransferMode,
    documentVisible: props.documentVisible,
    sceneVisible,
  });

  useEffect(() => {
    onVisibilityChange(sceneVisible);
  }, [onVisibilityChange, sceneVisible]);

  return (
    <section
      className={styles.scene}
      ref={sceneRef}
      data-camera-phase={props.interaction.camera.phase}
      data-camera-motion={sceneMotionAllowed ? 'on' : 'off'}
      data-selected={props.selected.id}
      data-selected-island={props.selected.islandKey}
      aria-label={props.copy.mapLabel}
    >
      <Image
        className={styles.overviewArtwork}
        data-active={showOverview}
        src={overviewSource}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 72vw, 1px"
        onError={() => setOverviewSource('/images/archipelago/archipelago-scene-v2-clean.png')}
      />
      {isOverview || focusFailed ? null : (
        <Image
          className={styles.focusArtwork}
          key={`${props.selected.id}-${cameraRevision}`}
          src={focusSource}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 72vw, 1px"
          onLoad={() => setLoadedFocusId(props.selected.id)}
          onError={() => setFailedFocusId(props.selected.id)}
        />
      )}
      {!isOverview && focusFailed ? (
        <div className={styles.focusFallback} aria-hidden="true" />
      ) : null}
      {sceneMotionAllowed ? <div className={styles.waterGlow} aria-hidden="true" /> : null}
      <div className={styles.sceneToolbar}>
        {!isOverview ? (
          <button type="button" onClick={props.onOverview}>{props.copy.overview}</button>
        ) : null}
        <span>{isOverview ? props.copy.choose : props.selected.name}</span>
      </div>
      <div className={styles.islandControls} aria-label={props.copy.choose}>
        {props.projects.map((project) => (
          <button
            className={styles.islandSelector}
            data-project-selector={project.id}
            data-island={project.islandKey}
            data-selected={project.id === props.selected.id && !isOverview}
            style={{
              left: `${(project.presentation.labelSafeRegion.x + project.presentation.labelSafeRegion.width / 2) * 100}%`,
              top: `${(project.presentation.labelSafeRegion.y + project.presentation.labelSafeRegion.height / 2) * 100}%`,
            }}
            key={project.id}
            type="button"
            aria-pressed={project.id === props.selected.id && !isOverview}
            onClick={() => props.onSelect(project.id)}
          >
            <span>{project.name}</span>
            <small>{project.progressPercent}%</small>
          </button>
        ))}
      </div>
      {isOverview ? null : (
        <WayfarerParty
          copy={props.copy}
          project={props.selected}
          freshness={props.freshness}
          motionMode={props.motionMode}
          simulatorState={props.simulatorState}
          selectionRevision={cameraRevision}
          selectionChanged={props.interaction.camera.phase === 'FOCUSING'}
          sceneVisible={sceneVisible}
          documentVisible={props.documentVisible}
          dataTransferMode={props.dataTransferMode}
          prefersReducedMotion={props.prefersReducedMotion}
          onOpenGuide={props.onOpenGuide}
          variant="desktop"
        />
      )}
    </section>
  );
}
