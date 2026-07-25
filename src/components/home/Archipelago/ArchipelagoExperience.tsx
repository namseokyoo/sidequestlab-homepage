'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  closeCrewDialog,
  createInteractionState,
  openCrewDialog,
  selectProject,
  settleFocus,
  type ArchipelagoInteractionState,
  type FocusTransition,
} from '@/lib/archipelago/interaction-state';
import type { FleetGuideRole } from '@/lib/archipelago/model';
import { isSceneMotionAllowed } from '@/lib/archipelago/motion-policy';
import { CrewGuideDialog } from './CrewGuideDialog';
import { DesktopScene } from './DesktopScene';
import { ExperienceControls } from './ExperienceControls';
import { MobileFleetFeed } from './MobileFleetFeed';
import { MobileOverview } from './MobileOverview';
import { ProjectDetail } from './ProjectDetail';
import { ProofHero } from './ProofHero';
import { getArchipelagoCopy } from './copy';
import type { MotionMode, SimulatorState } from './state';
import type { ArchipelagoProject, ArchipelagoView } from './types';
import { useExperienceEnvironment } from './useExperienceEnvironment';
import styles from './Shell.module.css';
export type ExperienceMode = 'public' | 'preview';

type ArchipelagoExperienceProps = {
  readonly view: ArchipelagoView;
  readonly experienceMode: ExperienceMode;
};
function getInitialProject(view: ArchipelagoView): ArchipelagoProject | null {
  return view.projects.find((project) => project.id === view.selectedProjectId)
    ?? view.projects[0]
    ?? null;
}
function selectedProjectId(interaction: ArchipelagoInteractionState): string | null {
  return interaction.camera.phase === 'OVERVIEW' ? null : interaction.camera.projectId;
}

export function ArchipelagoExperience({ view, experienceMode }: ArchipelagoExperienceProps) {
  const copy = getArchipelagoCopy(view.locale);
  const initialProject = getInitialProject(view);
  const [interaction, setInteraction] = useState<ArchipelagoInteractionState>(createInteractionState);
  const [lastSelectedId, setLastSelectedId] = useState(initialProject?.id ?? '');
  const [motionMode, setMotionMode] = useState<MotionMode>('SYSTEM');
  const [simulatorState, setSimulatorState] = useState<SimulatorState | null>(null);
  const [activeSceneVisible, setActiveSceneVisible] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const responsiveFocusProjectRef = useRef<string | null>(null);
  const previousDesktopRef = useRef<boolean | null>(null);
  const environment = useExperienceEnvironment();
  const cameraProjectId = selectedProjectId(interaction);
  const selected = useMemo(
    () => view.projects.find((project) => project.id === (cameraProjectId ?? lastSelectedId))
      ?? initialProject,
    [cameraProjectId, initialProject, lastSelectedId, view.projects],
  );

  useEffect(() => {
    if (interaction.camera.phase !== 'FOCUSING') return;
    const revision = interaction.camera.revision;
    const timeout = window.setTimeout(
      () => setInteraction((current) => settleFocus(current, revision)),
      360,
    );
    return () => window.clearTimeout(timeout);
  }, [interaction.camera]);

  useEffect(() => {
    function trackProjectFocus(event: FocusEvent) {
      const target = event.target;
      responsiveFocusProjectRef.current = target instanceof HTMLElement
        ? target.dataset.projectSelector ?? null
        : null;
    }
    document.addEventListener('focusin', trackProjectFocus);
    return () => document.removeEventListener('focusin', trackProjectFocus);
  }, []);

  useEffect(() => {
    const previous = previousDesktopRef.current;
    previousDesktopRef.current = environment.isDesktop;
    if (previous === null || previous === environment.isDesktop) return;
    const projectId = responsiveFocusProjectRef.current;
    if (projectId === null) return;
    const frame = window.requestAnimationFrame(() => {
      const candidates = document.querySelectorAll<HTMLButtonElement>('[data-project-selector]');
      const target = [...candidates].find(
        (candidate) => candidate.dataset.projectSelector === projectId,
      );
      target?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [environment.isDesktop]);

  if (selected === null) {
    return (
      <section className={styles.experience} data-archipelago-experience>
        <div className={styles.inner}>
          <ProofHero copy={copy} view={view} preview={experienceMode === 'preview'} />
        </div>
      </section>
    );
  }

  function select(projectId: string) {
    const transition: FocusTransition = isSceneMotionAllowed({
      freshness: view.freshness,
      motionMode,
      prefersReducedMotion: environment.prefersReducedMotion,
      dataTransferMode: environment.dataTransferMode,
      documentVisible: environment.documentVisible,
      sceneVisible: activeSceneVisible,
    })
      ? 'ANIMATED'
      : 'IMMEDIATE';
    setLastSelectedId(projectId);
    setSimulatorState(null);
    setInteraction((current) => selectProject(current, projectId, transition));
  }

  function returnToOverview() {
    setInteraction((current) => ({
      camera: { phase: 'OVERVIEW', revision: current.camera.revision + 1 },
      dialog: { phase: 'CLOSED' },
    }));
  }

  function openGuide(role: FleetGuideRole, trigger: HTMLButtonElement) {
    returnFocusRef.current = trigger;
    setInteraction((current) => openCrewDialog(current, role));
  }

  function closeGuide() {
    setInteraction((current) => closeCrewDialog(current));
    const trigger = returnFocusRef.current;
    if (trigger?.isConnected === true) trigger.focus();
  }

  const dialogState = interaction.dialog;
  const dialogProject = dialogState.phase === 'OPEN'
    ? view.projects.find((project) => project.id === dialogState.projectId) ?? null
    : null;
  const sourceDialogGuide = dialogState.phase === 'OPEN'
    ? dialogProject?.guides.find((guide) => guide.role === dialogState.role) ?? null
    : null;
  const dialogGuide = sourceDialogGuide === null || simulatorState === null
    ? sourceDialogGuide
    : { ...sourceDialogGuide, state: simulatorState, workSignifying: false };
  const announcement = `${selected.name}, ${copy.projectStates[selected.lifecycle]}, ${selected.progressPercent}%`;
  const commonSceneProps = {
    copy,
    project: selected,
    freshness: view.freshness,
    motionMode,
    simulatorState,
    selectionRevision: interaction.camera.revision,
    selectionChanged: interaction.camera.phase === 'FOCUSING',
    documentVisible: environment.documentVisible,
    dataTransferMode: environment.dataTransferMode,
    prefersReducedMotion: environment.prefersReducedMotion,
    onOpenGuide: openGuide,
    onVisibilityChange: setActiveSceneVisible,
  };

  return (
    <section className={styles.experience} data-archipelago-experience data-motion={motionMode}>
      <div className={styles.inner}>
        <ProofHero copy={copy} view={view} preview={experienceMode === 'preview'} />
        {environment.isDesktop ? (
          <div className={styles.desktopLayout}>
            <DesktopScene
              copy={copy}
              projects={view.projects}
              selected={selected}
              interaction={interaction}
              freshness={view.freshness}
              motionMode={motionMode}
              simulatorState={simulatorState}
              documentVisible={environment.documentVisible}
              dataTransferMode={environment.dataTransferMode}
              prefersReducedMotion={environment.prefersReducedMotion}
              onSelect={select}
              onOverview={returnToOverview}
              onOpenGuide={openGuide}
              onVisibilityChange={setActiveSceneVisible}
            />
            <aside className={styles.detailRail}>
              <ProjectDetail copy={copy} project={selected} />
              {experienceMode === 'preview' ? (
                <ExperienceControls
                  copy={copy}
                  motionMode={motionMode}
                  simulatorState={simulatorState}
                  onMotionChange={setMotionMode}
                  onStateChange={setSimulatorState}
                />
              ) : null}
            </aside>
          </div>
        ) : (
          <div className={styles.mobileExperience}>
            <MobileOverview {...commonSceneProps} />
            <MobileFleetFeed
              copy={copy}
              projects={view.projects}
              selected={selected}
              prefersReducedMotion={environment.prefersReducedMotion}
              onSelect={select}
            />
            {experienceMode === 'preview' ? (
              <ExperienceControls
                copy={copy}
                motionMode={motionMode}
                simulatorState={simulatorState}
                onMotionChange={setMotionMode}
                onStateChange={setSimulatorState}
              />
            ) : null}
          </div>
        )}
      </div>
      <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">{announcement}</p>
      <CrewGuideDialog
        copy={copy}
        guide={dialogGuide}
        project={dialogProject}
        simulated={simulatorState !== null}
        onClose={closeGuide}
      />
    </section>
  );
}
