'use client';

import styles from './V2.module.css';

type DayNightDialProps = {
  readonly night: number;
  readonly onChange: (night: number) => void;
  readonly dayLabel: string;
  readonly nightLabel: string;
};

export function DayNightDial({ night, onChange, dayLabel, nightLabel }: DayNightDialProps) {
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
            {isNight ? '🌙' : '☀️'}
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
    </div>
  );
}
