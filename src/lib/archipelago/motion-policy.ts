import type {
  FleetProjectionFreshness,
  FleetSemanticGuide,
} from './model.ts';

export type MotionMode = 'SYSTEM' | 'REDUCED' | 'OFF';
export type DataTransferMode = 'STANDARD' | 'SAVE_DATA';
export type GuideTerminalPose =
  | 'ASSEMBLE_COMPLETE'
  | 'INSPECT_COMPLETE'
  | 'OBSERVING';

export type MotionDecision = {
  readonly transition: 'ANIMATED' | 'IMMEDIATE';
  readonly guideMotion: 'PLAY_ONCE' | 'SETTLED';
  readonly activeAnimation: boolean;
  readonly terminalPose: GuideTerminalPose;
};

export type MotionDecisionInput = {
  readonly freshness: FleetProjectionFreshness;
  readonly motionMode: MotionMode;
  readonly prefersReducedMotion: boolean;
  readonly dataTransferMode: DataTransferMode;
  readonly documentVisible: boolean;
  readonly sceneVisible: boolean;
  readonly selectionChanged: boolean;
  readonly clipAvailable: boolean;
  readonly guide: FleetSemanticGuide;
};

export type SceneMotionInput = Pick<
  MotionDecisionInput,
  | 'freshness'
  | 'motionMode'
  | 'prefersReducedMotion'
  | 'dataTransferMode'
  | 'documentVisible'
  | 'sceneVisible'
>;

export function isSceneMotionAllowed(input: SceneMotionInput): boolean {
  return input.freshness === 'FRESH'
    && input.motionMode === 'SYSTEM'
    && !input.prefersReducedMotion
    && input.dataTransferMode === 'STANDARD'
    && input.documentVisible
    && input.sceneVisible;
}

function terminalPose(guide: FleetSemanticGuide): GuideTerminalPose {
  switch (guide.role) {
    case 'CODE_ENGINEER':
      return guide.state === 'WORKING'
        ? 'ASSEMBLE_COMPLETE'
        : 'OBSERVING';
    case 'QA_NAVIGATOR':
      return guide.state === 'TESTING' || guide.state === 'REVIEWING'
        ? 'INSPECT_COMPLETE'
        : 'OBSERVING';
  }
}

export function deriveMotionDecision(
  input: MotionDecisionInput,
): MotionDecision {
  const terminal = terminalPose(input.guide);
  const cameraAnimationEligible = isSceneMotionAllowed(input)
    && input.selectionChanged;
  const guideAnimationEligible = cameraAnimationEligible
    && input.freshness === 'FRESH'
    && input.clipAvailable
    && input.guide.source === 'SNAPSHOT'
    && input.guide.workSignifying
    && terminal !== 'OBSERVING';

  return {
    transition: cameraAnimationEligible ? 'ANIMATED' : 'IMMEDIATE',
    guideMotion: guideAnimationEligible ? 'PLAY_ONCE' : 'SETTLED',
    activeAnimation: guideAnimationEligible,
    terminalPose: terminal,
  };
}
