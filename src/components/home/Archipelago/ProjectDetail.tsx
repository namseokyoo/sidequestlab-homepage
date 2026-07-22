import type { ArchipelagoCopy } from './copy';
import type { ArchipelagoProject } from './types';
import styles from './Shell.module.css';

type ProjectDetailProps = {
  readonly copy: ArchipelagoCopy;
  readonly project: ArchipelagoProject;
  readonly mode?: 'full' | 'supplemental';
};

export function ProjectDetail({ copy, project, mode = 'full' }: ProjectDetailProps) {
  return (
    <div className={styles.projectDetail} data-mode={mode} data-project={project.id}>
      <div className={styles.detailHeading}>
        {mode === 'full' ? (
          <div>
            <p className={styles.detailKicker}>{copy.selected}</p>
            <h2>{project.name}</h2>
          </div>
        ) : <p className={styles.detailKicker}>{copy.selected}</p>}
        <span className={styles.health} data-health={project.health}>
          {copy.healthStates[project.health]}
        </span>
      </div>
      {mode === 'full' ? (
        <>
          <p className={styles.detailSummary} data-fact-owner="summary">{project.summary}</p>
          <div className={styles.publicProof}>
            <p data-fact-owner="outcome"><span>{copy.outcome}</span><strong>{project.outcome}</strong></p>
            <p data-fact-owner="updated"><span>{copy.updated}</span><time>{project.updatedAtLabel}</time></p>
          </div>
        </>
      ) : null}
      <dl className={styles.statusGrid}>
        {mode === 'full' ? (
          <div>
            <dt>{copy.lifecycleLabel}</dt>
            <dd>{copy.projectStates[project.lifecycle]}</dd>
          </div>
        ) : null}
        <div>
          <dt>{copy.progressLabel}</dt>
          <dd>{project.progressPercent}%</dd>
        </div>
        <div>
          <dt>{copy.versionLabel}</dt>
          <dd>{project.version}</dd>
        </div>
      </dl>
      <div className={styles.progress} data-fact-owner="progress" aria-label={`${project.progressPercent}%`}>
        <span style={{ width: `${project.progressPercent}%` }} />
      </div>
      <div className={styles.actionRow}>
        {mode === 'full' ? (
          <a className={styles.primaryLink} href={project.detailHref}>
            {copy.details} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {project.liveHref === null ? (
          <span className={styles.unavailableAction}>{copy.unavailableLive}</span>
        ) : (
          <a href={project.liveHref} target="_blank" rel="noreferrer">
            {copy.visit} <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {project.evidenceHref === null ? (
          <span className={styles.unavailableAction}>{copy.unavailableEvidence}</span>
        ) : (
          <a href={project.evidenceHref} target="_blank" rel="noreferrer">
            {copy.evidence} <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}
