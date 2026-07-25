'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import type { FleetGuideRole } from '@/lib/archipelago/model';
import type { FleetProjectionFreshness } from '@/lib/archipelago/model';
import type { DataTransferMode, MotionMode } from '@/lib/archipelago/motion-policy';
import { isSceneMotionAllowed } from '@/lib/archipelago/motion-policy';

import { WayfarerParty } from './WayfarerParty';
import type { ArchipelagoCopy } from './copy';
import type { SimulatorState } from './state';
import type { ArchipelagoProject } from './types';
import { useSceneVisibility } from './useSceneVisibility';
import styles from './Scene.module.css';

type MobileOverviewProps = {
  readonly copy: ArchipelagoCopy;
  readonly project: ArchipelagoProject;
  readonly freshness: FleetProjectionFreshness;
  readonly motionMode: MotionMode;
  readonly simulatorState: SimulatorState | null;
  readonly selectionRevision: number;
  readonly selectionChanged: boolean;
  readonly documentVisible: boolean;
  readonly dataTransferMode: DataTransferMode;
  readonly prefersReducedMotion: boolean;
  readonly onOpenGuide: (role: FleetGuideRole, trigger: HTMLButtonElement) => void;
  readonly onVisibilityChange: (visible: boolean) => void;
};

export function MobileOverview(props: MobileOverviewProps) {
  const [source, setSource] = useState('/images/archipelago/archipelago-mobile-v3-projects.png');
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
      className={styles.mobileOverview}
      data-camera-motion={sceneMotionAllowed ? 'on' : 'off'}
      ref={sceneRef}
      aria-label={props.copy.choose}
    >
      <Image
        className={styles.mobileOverviewArtwork}
        src={source}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 1px"
        onError={() => setSource('/images/archipelago/archipelago-mobile-v2-clean.png')}
      />
      <div className={styles.mobileSelectionLabel}>
        <span>{props.copy.selected}</span>
        <strong>{props.project.name}</strong>
      </div>
      <WayfarerParty
        copy={props.copy}
        project={props.project}
        freshness={props.freshness}
        motionMode={props.motionMode}
        simulatorState={props.simulatorState}
        selectionRevision={props.selectionRevision}
        selectionChanged={props.selectionChanged}
        sceneVisible={sceneVisible}
        documentVisible={props.documentVisible}
        dataTransferMode={props.dataTransferMode}
        prefersReducedMotion={props.prefersReducedMotion}
        onOpenGuide={props.onOpenGuide}
        variant="mobile"
      />
    </section>
  );
}
