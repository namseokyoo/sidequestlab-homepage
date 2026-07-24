'use client';

import type { ReactNode } from 'react';

import styles from './V2.module.css';
import { IconAnchor, IconHammer, IconMap, IconSearch } from './icons';

export type FleetStatGroup = {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly lifecycles: readonly string[];
};

type FleetStatsProps = {
  readonly total: number;
  readonly totalLabel: string;
  readonly groups: readonly FleetStatGroup[];
  readonly latestLabel: string;
  readonly latestDate: string;
  readonly activeGroup: string | null;
  readonly onGroupToggle: (key: string) => void;
};

const GROUP_ICONS: Record<string, ReactNode> = {
  operating: <IconAnchor size={13} />,
  building: <IconHammer size={13} />,
  verifying: <IconSearch size={13} />,
  planning: <IconMap size={13} />,
};

/**
 * Dashboard aggregate strip under the header — answers "what is the
 * fleet doing right now?" at a glance. Each group is a filter toggle:
 * clicking highlights the matching islands in the world.
 */
export function FleetStats({ total, totalLabel, groups, latestLabel, latestDate, activeGroup, onGroupToggle }: FleetStatsProps) {
  return (
    <div className={styles.fleetStats} role="group" aria-label={totalLabel}>
      <span className={styles.fleetStatsTotal}>
        <strong>{total}</strong>
        {totalLabel}
      </span>
      {groups
        .filter((group) => group.count > 0)
        .map((group) => (
          <button
            key={group.key}
            type="button"
            className={styles.fleetStatChip}
            data-group={group.key}
            data-active={activeGroup === group.key}
            aria-pressed={activeGroup === group.key}
            onClick={() => onGroupToggle(group.key)}
          >
            <span className={styles.fleetStatIcon} aria-hidden="true">
              {GROUP_ICONS[group.key]}
            </span>
            <strong>{group.count}</strong>
            {group.label}
          </button>
        ))}
      <span className={styles.fleetStatsLatest}>
        {latestLabel} <time>{latestDate}</time>
      </span>
    </div>
  );
}
