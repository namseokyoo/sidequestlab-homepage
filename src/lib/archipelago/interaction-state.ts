import type { FleetGuideRole } from './model.ts';

export type CameraState =
  | { readonly phase: 'OVERVIEW'; readonly revision: number }
  | {
      readonly phase: 'FOCUSING';
      readonly projectId: string;
      readonly revision: number;
    }
  | {
      readonly phase: 'FOCUSED';
      readonly projectId: string;
      readonly revision: number;
    };

export type CrewDialogState =
  | { readonly phase: 'CLOSED' }
  | {
      readonly phase: 'OPEN';
      readonly projectId: string;
      readonly role: FleetGuideRole;
    };

export type ArchipelagoInteractionState = {
  readonly camera: CameraState;
  readonly dialog: CrewDialogState;
};

export type FocusTransition = 'ANIMATED' | 'IMMEDIATE';

export type InteractionEligibility = {
  readonly canOpenCrewDialog: boolean;
  readonly canUseProjectActions: boolean;
  readonly canReturnToOverview: boolean;
};

export function createInteractionState(): ArchipelagoInteractionState {
  return {
    camera: { phase: 'OVERVIEW', revision: 0 },
    dialog: { phase: 'CLOSED' },
  };
}

function selectedProjectId(camera: CameraState): string | null {
  switch (camera.phase) {
    case 'OVERVIEW':
      return null;
    case 'FOCUSING':
    case 'FOCUSED':
      return camera.projectId;
  }
}

export function selectProject(
  state: ArchipelagoInteractionState,
  projectId: string,
  transition: FocusTransition,
): ArchipelagoInteractionState {
  if (selectedProjectId(state.camera) === projectId) return state;
  const revision = state.camera.revision + 1;
  return {
    camera: transition === 'ANIMATED'
      ? { phase: 'FOCUSING', projectId, revision }
      : { phase: 'FOCUSED', projectId, revision },
    dialog: { phase: 'CLOSED' },
  };
}

export function settleFocus(
  state: ArchipelagoInteractionState,
  revision: number,
): ArchipelagoInteractionState {
  if (
    state.camera.phase !== 'FOCUSING'
    || state.camera.revision !== revision
  ) {
    return state;
  }
  return {
    ...state,
    camera: {
      phase: 'FOCUSED',
      projectId: state.camera.projectId,
      revision,
    },
  };
}

export function openCrewDialog(
  state: ArchipelagoInteractionState,
  role: FleetGuideRole,
): ArchipelagoInteractionState {
  const projectId = selectedProjectId(state.camera);
  return projectId === null
    ? state
    : { ...state, dialog: { phase: 'OPEN', projectId, role } };
}

export function closeCrewDialog(
  state: ArchipelagoInteractionState,
): ArchipelagoInteractionState {
  return state.dialog.phase === 'CLOSED'
    ? state
    : { ...state, dialog: { phase: 'CLOSED' } };
}

export function getInteractionEligibility(
  state: ArchipelagoInteractionState,
): InteractionEligibility {
  const hasSelection = selectedProjectId(state.camera) !== null;
  return {
    canOpenCrewDialog: hasSelection,
    canUseProjectActions: hasSelection,
    canReturnToOverview: hasSelection,
  };
}
