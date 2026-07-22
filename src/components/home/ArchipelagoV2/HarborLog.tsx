'use client';

import styles from './V2.module.css';

export type HarborLogEntry = {
  readonly projectId: string;
  readonly projectName: string;
  readonly action: string;
  readonly timestamp: string;
  readonly lifecycle: string;
  readonly version: string;
};

type HarborLogProps = {
  readonly entries: readonly HarborLogEntry[];
  readonly title: string;
  readonly subtitle: string;
  readonly onSelectProject: (projectId: string) => void;
  readonly selectedProjectId: string | null;
};

const LIFECYCLE_ICONS: Record<string, string> = {
  BUILDING: '🔨',
  MAINTENANCE: '🧹',
  OPERATING: '⚓',
  TESTING: '🔍',
  PLANNING: '🗺️',
  DEPLOYING: '🚀',
  REVIEWING: '📋',
};

export function HarborLog({ entries, title, subtitle, onSelectProject, selectedProjectId }: HarborLogProps) {
  return (
    <nav className={styles.harborLog} aria-label={title}>
      <div className={styles.harborLogHeader}>
        <h2 className={styles.harborLogTitle}>{title}</h2>
        <p className={styles.harborLogSubtitle}>{subtitle}</p>
      </div>
      <ul className={styles.harborLogList}>
        {entries.map((entry) => (
          <li key={entry.projectId}>
            <button
              type="button"
              className={styles.harborLogEntry}
              data-selected={entry.projectId === selectedProjectId}
              onClick={() => onSelectProject(entry.projectId)}
            >
              <span className={styles.harborLogIcon} aria-hidden="true">
                {LIFECYCLE_ICONS[entry.lifecycle] ?? '📍'}
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
