'use client';

import styles from './V2.module.css';
import { IconMoon, IconRefresh, IconSun } from './icons';

type DayNightDialProps = {
  readonly night: number;
  readonly onChange: (night: number) => void;
  readonly dayLabel: string;
  readonly nightLabel: string;
  readonly autoCycle: boolean;
  readonly onAutoToggle: () => void;
  readonly autoCycleLabel: string;
  readonly autoCycleOnLabel: string;
};

export function DayNightDial({ night, onChange, dayLabel, nightLabel, autoCycle, onAutoToggle, autoCycleLabel, autoCycleOnLabel }: DayNightDialProps) {
  const isNight = night > 0.5;
  return (
    <div className={styles.dayNightDial}>
      <button
        type="button"
        className={styles.dialToggle}
        role="switch"
        aria-checked={isNight}
        aria-label={isNight ? nightLabel : dayLabel}
        onClick={() => onChange(isNight ? 0 : 1)}
        data-night={isNight}
      >
        <span className={styles.dialTrack} aria-hidden="true">
        <span className={styles.dialThumb} data-night={isNight}>
          {isNight ? <IconMoon size={11} strokeWidth={2.5} /> : <IconSun size={11} strokeWidth={2.5} />}
        </span>
        </span>
        <span className={styles.dialLabel}>{isNight ? nightLabel : dayLabel}</span>
      </button>
      <input
        type="range"
        className={styles.dialSlider}
        min={0}
        max={100}
        value={Math.round(night * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        aria-label={`${dayLabel} ↔ ${nightLabel}`}
      />
      <button
        type="button"
        className={styles.dialAuto}
        onClick={onAutoToggle}
        aria-pressed={autoCycle}
        aria-label={autoCycle ? autoCycleOnLabel : autoCycleLabel}
        title={autoCycle ? autoCycleOnLabel : autoCycleLabel}
      >
        <span className={styles.dialAutoIcon} aria-hidden="true"><IconRefresh size={11} /></span>
        <span className={styles.dialAutoText}>{autoCycleLabel}</span>
        {autoCycle ? <span className={styles.dialAutoDot} aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
