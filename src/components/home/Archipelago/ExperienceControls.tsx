import {
  MOTION_MODES,
  SIMULATOR_STATES,
  type MotionMode,
  type SimulatorState,
} from './state';
import type { ArchipelagoCopy } from './copy';
import styles from './Shell.module.css';

type ExperienceControlsProps = {
  readonly copy: ArchipelagoCopy;
  readonly motionMode: MotionMode;
  readonly simulatorState: SimulatorState | null;
  readonly onMotionChange: (mode: MotionMode) => void;
  readonly onStateChange: (state: SimulatorState) => void;
};

const MOTION_LABELS = {
  SYSTEM: 'motionSystem',
  REDUCED: 'motionReduced',
  OFF: 'motionOff',
} as const;

export function ExperienceControls({
  copy,
  motionMode,
  simulatorState,
  onMotionChange,
  onStateChange,
}: ExperienceControlsProps) {
  return (
    <div className={styles.controls}>
      <fieldset>
        <legend>{copy.motion}</legend>
        {MOTION_MODES.map((mode) => (
          <button
            aria-pressed={motionMode === mode}
            key={mode}
            type="button"
            onClick={() => onMotionChange(mode)}
          >
            {copy[MOTION_LABELS[mode]]}
          </button>
        ))}
      </fieldset>
      <fieldset>
        <legend>{copy.demoState}</legend>
        {SIMULATOR_STATES.map((state) => (
          <button
            aria-pressed={simulatorState === state}
            key={state}
            type="button"
            onClick={() => onStateChange(state)}
          >
            {copy.guideStates[state]}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
