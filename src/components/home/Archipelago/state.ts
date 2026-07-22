import type { FleetSemanticGuide, WayfarerState } from '@/lib/archipelago/model';
import type { MotionMode } from '@/lib/archipelago/motion-policy';

export type { MotionMode } from '@/lib/archipelago/motion-policy';

export const SIMULATOR_STATES = [
  'IDLE',
  'WORKING',
  'WAITING_FOR_HUMAN',
  'BLOCKED',
  'COMPLETED',
] as const satisfies readonly WayfarerState[];

export const MOTION_MODES = ['SYSTEM', 'REDUCED', 'OFF'] as const satisfies readonly MotionMode[];

export type SimulatorState = (typeof SIMULATOR_STATES)[number];
export type WayfarerPose =
  | 'resting'
  | 'planning'
  | 'working'
  | 'testing'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'observing';

export type WayfarerVisualState = {
  readonly pose: WayfarerPose;
  readonly animated: boolean;
  readonly workSignifying: boolean;
};

export type WayfarerPoseFrame = 0 | 1 | 2 | 3;
export type GuideDisplayState = WayfarerState | 'OBSERVING_PUBLIC' | 'NO_PUBLIC_ACTIVITY';

const WORK_SIGNIFYING_STATES = new Set<WayfarerState>([
  'PLANNING',
  'WORKING',
  'REVIEWING',
  'TESTING',
  'MONITORING',
]);

export function getGuideDisplayState(
  guide: FleetSemanticGuide,
  simulated: boolean,
): GuideDisplayState {
  if (simulated) return guide.state;
  if (guide.source === 'SYMBOLIC') return 'NO_PUBLIC_ACTIVITY';
  if (!guide.workSignifying && WORK_SIGNIFYING_STATES.has(guide.state)) {
    return 'OBSERVING_PUBLIC';
  }
  return guide.state;
}

/**
 * The approved sheet has idle, travel, tool-work, and completed frames.
 * Blocked/observing intentionally share the calm idle frame; their text and
 * work-zone treatment carry the unavailable state without implying activity.
 */
export function getWayfarerPoseFrame(pose: WayfarerPose): WayfarerPoseFrame {
  switch (pose) {
    case 'waiting': return 1;
    case 'planning':
    case 'working':
    case 'testing': return 2;
    case 'completed': return 3;
    case 'resting':
    case 'blocked':
    case 'observing': return 0;
    default: return assertNever(pose);
  }
}

type WayfarerVisualInput = {
  readonly state: WayfarerState;
  readonly workMotionAllowed: boolean;
};

function assertNever(value: never): never {
  throw new TypeError(`Unhandled Wayfarer state: ${String(value)}`);
}

export function deriveWayfarerVisualState({
  state,
  workMotionAllowed,
}: WayfarerVisualInput): WayfarerVisualState {
  switch (state) {
    case 'IDLE':
      return { pose: 'resting', animated: false, workSignifying: false };
    case 'PLANNING':
      if (!workMotionAllowed) {
        return { pose: 'observing', animated: false, workSignifying: false };
      }
      return {
        pose: 'planning',
        animated: workMotionAllowed,
        workSignifying: workMotionAllowed,
      };
    case 'WORKING':
      if (!workMotionAllowed) {
        return { pose: 'observing', animated: false, workSignifying: false };
      }
      return {
        pose: 'working',
        animated: workMotionAllowed,
        workSignifying: workMotionAllowed,
      };
    case 'REVIEWING':
    case 'TESTING':
      if (!workMotionAllowed) {
        return { pose: 'observing', animated: false, workSignifying: false };
      }
      return {
        pose: 'testing',
        animated: workMotionAllowed,
        workSignifying: workMotionAllowed,
      };
    case 'WAITING_FOR_HUMAN':
      return { pose: 'waiting', animated: false, workSignifying: false };
    case 'BLOCKED':
      return { pose: 'blocked', animated: false, workSignifying: false };
    case 'COMPLETED':
      return { pose: 'completed', animated: false, workSignifying: false };
    case 'MONITORING':
      if (!workMotionAllowed) {
        return { pose: 'observing', animated: false, workSignifying: false };
      }
      return {
        pose: 'observing',
        animated: workMotionAllowed,
        workSignifying: workMotionAllowed,
      };
    default:
      return assertNever(state);
  }
}
