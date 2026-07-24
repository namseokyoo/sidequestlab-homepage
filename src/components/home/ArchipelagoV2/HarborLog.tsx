'use client';

import type { ReactNode } from 'react';

import styles from './V2.module.css';
import {
  IconAnchor,
  IconClipboard,
  IconHammer,
  IconMap,
  IconMapPin,
  IconRocket,
  IconSearch,
  IconWrench,
} from './icons';

export type HarborLogEntry = {
  readonly projectId: string;
  readonly projectName: string;
  readonly action: string;
  readonly timestamp: string;
  readonly lifecycle: string;
  readonly version: string;
  /** True right after a live activity pulse — triggers a brief flash. */
  readonly fresh?: boolean;
};

type HarborLogProps = {
  readonly entries: readonly HarborLogEntry[];
  readonly title: string;
  readonly subtitle: string;
  readonly onSelectProject: (projectId: string) => void;
  readonly selectedProjectId: string | null;
};

const LIFECYCLE_ICONS: Record<string, ReactNode> = {
  BUILDING: <IconHammer size={15} />,
  MAINTENANCE: <IconWrench size={15} />,
  OPERATING: <IconAnchor size={15} />,
  TESTING: <IconSearch size={15} />,
  PLANNING: <IconMap size={15} />,
  DEPLOYING: <IconRocket size={15} />,
  REVIEWING: <IconClipboard size={15} />,
};

export function HarborLog({ entries, title, subtitle, onSelectProject, selectedProjectId }: HarborLogProps) {
  return (
    <nav className={styles.harborLog} aria-label={title}>
      <div className={styles.harborLogHeader}>
        <h2 className={styles.harborLogTitle}>{title}</h2>
        <p className={styles.harborLogSubtitle}>{subtitle}</p>
      </div>
      <ul className={styles.harborLogList}>
        {entries.map((entry, index) => (
          <li key={entry.projectId} style={{ '--log-delay': `${550 + index * 60}ms` } as import('react').CSSProperties}>
            <button
              type="button"
              className={`${styles.harborLogEntry}${entry.fresh ? ` ${styles.harborLogEntryFresh}` : ''}`}
              data-selected={entry.projectId === selectedProjectId}
              data-fresh={entry.fresh === true}
              onClick={() => onSelectProject(entry.projectId)}
            >
              <span className={styles.harborLogIcon} aria-hidden="true">
                {LIFECYCLE_ICONS[entry.lifecycle] ?? <IconMapPin size={15} />}
              </span>
              <span className={styles.harborLogBody}>
                <span className={styles.harborLogName}>
                  {entry.projectName}
                  <span className={styles.harborLogVersion}>{entry.version}</span>
                </span>
                <span className={styles.harborLogAction}>{entry.action}</span>
              </span>
              <time className={styles.harborLogTime}>{entry.timestamp}</time>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
