'use client';
import Image from 'next/image';
import { useEffect, useState, type MouseEvent } from 'react';
import type {
  FleetGuideRole,
  FleetProjectionFreshness,
  FleetSemanticGuide,
} from '@/lib/archipelago/model';
import {
  deriveMotionDecision,
  isSceneMotionAllowed,
  type DataTransferMode,
  type MotionMode,
} from '@/lib/archipelago/motion-policy';
import type { ArchipelagoCopy } from './copy';
import { getGuidePosition, type GuidePlacementVariant } from './guide-position';
import {
  deriveWayfarerVisualState,
  getGuideDisplayState,
  getWayfarerPoseFrame,
  type SimulatorState,
} from './state';
import type { ArchipelagoProject } from './types';
import styles from './Wayfarers.module.css';
type WayfarerPartyProps = {
  readonly copy: ArchipelagoCopy;
  readonly project: ArchipelagoProject;
  readonly freshness: FleetProjectionFreshness;
  readonly motionMode: MotionMode;
  readonly simulatorState: SimulatorState | null;
  readonly selectionRevision: number;
  readonly selectionChanged: boolean;
  readonly sceneVisible: boolean;
  readonly documentVisible: boolean;
  readonly dataTransferMode: DataTransferMode;
  readonly prefersReducedMotion: boolean;
  readonly onOpenGuide: (role: FleetGuideRole, trigger: HTMLButtonElement) => void;
  readonly variant: GuidePlacementVariant;
};
function roleName(role: FleetGuideRole): string {
  return role === 'CODE_ENGINEER' ? 'Code Engineer' : 'QA Navigator';
}
function staticSheet(role: FleetGuideRole): string {
  return role === 'CODE_ENGINEER'
    ? '/images/wayfarers/code-engineer-v1-poses.png'
    : '/images/wayfarers/qa-navigator-v1-poses.png';
}
function motionStrip(role: FleetGuideRole): string {
  return role === 'CODE_ENGINEER'
    ? '/images/wayfarers/code-engineer-work-v1.png'
    : '/images/wayfarers/qa-navigator-test-v1.png';
}
function WayfarerButton({
  copy,
  guide,
  project,
  shouldAnimate,
  canContinueAnimation,
  simulated,
  selectionRevision,
  position,
  onOpenGuide,
}: {
  readonly copy: ArchipelagoCopy;
  readonly guide: FleetSemanticGuide;
  readonly project: ArchipelagoProject;
  readonly shouldAnimate: boolean;
  readonly canContinueAnimation: boolean;
  readonly simulated: boolean;
  readonly selectionRevision: number;
  readonly position: { readonly x: number; readonly y: number };
  readonly onOpenGuide: (role: FleetGuideRole, trigger: HTMLButtonElement) => void;
}) {
  const [settledRevision, setSettledRevision] = useState<number | null>(null);
  const [armedRevision] = useState<number | null>(() => (
    shouldAnimate ? selectionRevision : null
  ));
  const playing = canContinueAnimation
    && armedRevision === selectionRevision
    && settledRevision !== selectionRevision;

  useEffect(() => {
    if (
      armedRevision === selectionRevision
      && !canContinueAnimation
      && settledRevision !== selectionRevision
    ) {
      const frame = window.requestAnimationFrame(() => {
        setSettledRevision(selectionRevision);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [armedRevision, canContinueAnimation, selectionRevision, settledRevision]);
  const visual = deriveWayfarerVisualState({
    state: guide.state,
    workMotionAllowed: guide.workSignifying || simulated,
  });
  const frame = getWayfarerPoseFrame(visual.pose);
  const displayState = getGuideDisplayState(guide, simulated);
  const stateLabel = displayState === 'OBSERVING_PUBLIC'
    ? copy.observing
    : displayState === 'NO_PUBLIC_ACTIVITY'
      ? copy.noCrew
      : copy.guideStates[displayState];
  const sourceLabel = simulated
    ? copy.simulatedState
    : guide.source === 'SNAPSHOT'
      ? copy.publishedSnapshot
      : copy.symbolicGuides;

  function open(event: MouseEvent<HTMLButtonElement>) {
    onOpenGuide(guide.role, event.currentTarget);
  }

  return (
    <button
      className={styles.wayfarer}
      data-motion-state={playing ? 'playing' : 'settled'}
      data-pose={visual.pose}
      data-role={guide.role}
      data-guide-source={guide.source}
      data-work-signifying={guide.workSignifying}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      type="button"
      aria-label={`${roleName(guide.role)}, ${project.name}, ${stateLabel}, ${sourceLabel}`}
      onClick={open}
    >
      <span className={styles.character} data-frame={frame} aria-hidden="true">
        <Image
          className={styles.poseSheet}
          src={staticSheet(guide.role)}
          alt=""
          width={2048}
          height={2048}
          sizes="240px"
        />
        {playing ? (
          <Image
            className={styles.motionStrip}
            src={motionStrip(guide.role)}
            alt=""
            width={2048}
            height={256}
            sizes="768px"
            onAnimationEnd={() => setSettledRevision(selectionRevision)}
            onError={() => setSettledRevision(selectionRevision)}
          />
        ) : null}
      </span>
      <span className={styles.wayfarerLabel}>
        <strong>{roleName(guide.role)}</strong>
        <small>{stateLabel}</small>
      </span>
    </button>
  );
}

export function WayfarerParty(props: WayfarerPartyProps) {
  return (
    <div
      className={styles.party}
      data-variant={props.variant}
      aria-label={`2 AI guides for ${props.project.name}`}
    >
      {props.project.guides.map((guide) => {
        const project = props.project;
        const position = getGuidePosition(
          project.presentation.crewAnchors.codeEngineer,
          project.presentation.crewAnchors.qaNavigator,
          project.presentation.mobileCrewAnchors,
          project.presentation.focusBox,
          guide.role,
          props.variant,
        );
        const simulatedGuide = props.simulatorState === null
          ? guide
          : { ...guide, state: props.simulatorState, workSignifying: false };
        const decision = deriveMotionDecision({
          freshness: props.freshness,
          motionMode: props.motionMode,
          prefersReducedMotion: props.prefersReducedMotion,
          dataTransferMode: props.dataTransferMode,
          documentVisible: props.documentVisible,
          sceneVisible: props.sceneVisible,
          selectionChanged: props.selectionChanged && props.simulatorState === null,
          clipAvailable: true,
          guide: simulatedGuide,
        });
        const canContinueAnimation = isSceneMotionAllowed({
          freshness: props.freshness,
          motionMode: props.motionMode,
          prefersReducedMotion: props.prefersReducedMotion,
          dataTransferMode: props.dataTransferMode,
          documentVisible: props.documentVisible,
          sceneVisible: props.sceneVisible,
        })
          && simulatedGuide.source === 'SNAPSHOT'
          && simulatedGuide.workSignifying;
        return (
          <WayfarerButton
            copy={props.copy}
            guide={simulatedGuide}
            project={props.project}
            shouldAnimate={decision.activeAnimation}
            canContinueAnimation={canContinueAnimation}
            simulated={props.simulatorState !== null}
            selectionRevision={props.selectionRevision}
            position={position}
            onOpenGuide={props.onOpenGuide}
            key={`${guide.id}-${props.selectionRevision}`}
          />
        );
      })}
      {props.simulatorState === null
        && props.project.guides.every((guide) => guide.source === 'SYMBOLIC') ? (
          <p className={styles.symbolicDisclosure}>{props.copy.noCrew}</p>
        ) : null}
    </div>
  );
}
