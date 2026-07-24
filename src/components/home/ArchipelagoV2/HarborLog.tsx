'use client';

import { useState, type ReactNode } from 'react';

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
  readonly summary: string;
  readonly showAllLabel: string;
  readonly showLessLabel: string;
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

/** Number of most-recent entries shown before the "show all" toggle. */
const COLLAPSED_COUNT = 5;

export function HarborLog({ entries, title, subtitle, summary, showAllLabel, showLessLabel, onSelectProject, selectedProjectId }: HarborLogProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
  return (
    <nav className={styles.harborLog} aria-label={title}>
      <div className={styles.harborLogHeader}>
        <h2 className={styles.harborLogTitle}>{title}</h2>
        <p className={styles.harborLogSubtitle}>{subtitle}</p>
        <span className={styles.harborLogSummary}>{summary}</span>
        {entries.length > COLLAPSED_COUNT ? (
          <button
            type="button"
            className={styles.harborLogToggle}
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? showLessLabel : `${showAllLabel} (${entries.length})`}
          </button>
        ) : null}
      </div>
      <ul className={styles.harborLogList}>
        {visible.map((entry, index) => (
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
