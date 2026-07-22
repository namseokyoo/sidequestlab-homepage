'use client';

import styles from './V2.module.css';

export type OverlayProject = {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly lifecycleLabel: string;
  readonly progressPercent: number;
  readonly version: string;
  readonly updatedAtLabel: string;
  readonly outcome: string;
  readonly detailHref: string;
  readonly liveHref: string | null;
  readonly evidenceHref: string | null;
};

type ProjectOverlayProps = {
  readonly project: OverlayProject;
  readonly labels: {
    readonly selected: string;
    readonly lifecycle: string;
    readonly progress: string;
    readonly version: string;
    readonly updated: string;
    readonly outcome: string;
    readonly details: string;
    readonly visit: string;
    readonly evidence: string;
    readonly unavailableLive: string;
    readonly unavailableEvidence: string;
    readonly overview: string;
  };
  readonly onOverview: () => void;
};

export function ProjectOverlay({ project, labels, onOverview }: ProjectOverlayProps) {
  return (
    <div className={styles.projectOverlay} data-project={project.id}>
      <div className={styles.overlayHeader}>
        <div>
          <p className={styles.overlayKicker}>{labels.selected}</p>
          <h2 className={styles.overlayTitle}>{project.name}</h2>
        </div>
        <button type="button" className={styles.overlayBack} onClick={onOverview}>
          ← {labels.overview}
        </button>
      </div>

      <p className={styles.overlaySummary}>{project.summary}</p>

      <dl className={styles.overlayStats}>
        <div>
          <dt>{labels.lifecycle}</dt>
          <dd>{project.lifecycleLabel}</dd>
        </div>
        <div>
          <dt>{labels.progress}</dt>
          <dd>{project.progressPercent}%</dd>
        </div>
        <div>
          <dt>{labels.version}</dt>
          <dd>{project.version}</dd>
        </div>
      </dl>

      <div className={styles.overlayProgress} aria-label={`${labels.progress} ${project.progressPercent}%`}>
        <span style={{ width: `${project.progressPercent}%` }} />
      </div>

      <p className={styles.overlayOutcome}>
        <span>{labels.outcome}</span>
        <strong>{project.outcome}</strong>
      </p>
      <p className={styles.overlayUpdated}>
        <span>{labels.updated}</span>
        <time>{project.updatedAtLabel}</time>
      </p>

      <div className={styles.overlayActions}>
        <a className={styles.overlayPrimary} href={project.detailHref}>
          {labels.details} ↗
        </a>
        {project.liveHref === null ? (
          <span className={styles.overlayUnavailable}>{labels.unavailableLive}</span>
        ) : (
          <a href={project.liveHref} target="_blank" rel="noreferrer">
            {labels.visit}
          </a>
        )}
        {project.evidenceHref === null ? (
          <span className={styles.overlayUnavailable}>{labels.unavailableEvidence}</span>
        ) : (
          <a href={project.evidenceHref} target="_blank" rel="noreferrer">
            {labels.evidence}
          </a>
        )}
      </div>
    </div>
  );
}
