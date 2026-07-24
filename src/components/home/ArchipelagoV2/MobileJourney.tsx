'use client';

import type { ReactNode } from 'react';

import { FLAGSHIP_IDS, islandTier } from '@/lib/archipelago-world/islands';
import { projects as projectCatalog } from '@/lib/projects';

import styles from './V2.module.css';
import { IconAnchor, IconArrowUpRight, IconHammer, IconMap, IconSearch } from './icons';

import type { ArchipelagoProject } from '../Archipelago/types';

type MobileJourneyProps = {
  readonly projects: readonly ArchipelagoProject[];
  readonly labels: {
    readonly lifecycle: string;
    readonly progress: string;
    readonly version: string;
    readonly updated: string;
    readonly details: string;
    readonly visit: string;
    readonly evidence: string;
    readonly unavailableLive: string;
    readonly unavailableEvidence: string;
    readonly projectStates: Record<string, string>;
  };
};

const LIFECYCLE_ICONS: Record<string, ReactNode> = {
  BUILDING: <IconHammer size={14} />,
  DEPLOYING: <IconHammer size={14} />,
  OPERATING: <IconAnchor size={14} />,
  MAINTENANCE: <IconAnchor size={14} />,
  TESTING: <IconSearch size={14} />,
  REVIEWING: <IconSearch size={14} />,
  PLANNING: <IconMap size={14} />,
  DESIGNING: <IconMap size={14} />,
  IDEA: <IconMap size={14} />,
};

/** Rank for the vertical journey: flagships first, then build order. */
function journeyRank(project: ArchipelagoProject, index: number): number {
  const flagshipIndex = FLAGSHIP_IDS.indexOf(project.id);
  if (flagshipIndex !== -1) return flagshipIndex;
  return FLAGSHIP_IDS.length + index;
}

/**
 * Mobile vertical journey — replaces the desktop map stage below 768px.
 * Instead of shrinking the world into an unreadable miniature, each
 * project becomes a full-width diorama card carrying its name, purpose,
 * status, proof links, and tech, in flagship-first order.
 */
export function MobileJourney({ projects, labels }: MobileJourneyProps) {
  const ordered = projects
    .map((project, index) => ({ project, rank: journeyRank(project, index) }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.project);

  return (
    <div className={styles.mobileJourney}>
      {ordered.map((project, index) => {
        const catalog = projectCatalog.find((c) => c.id === project.id);
        const tech = catalog?.techStack.slice(0, 3) ?? [];
        const tier = islandTier(
          project.id,
          projects.filter((p) => !FLAGSHIP_IDS.includes(p.id)).findIndex((p) => p.id === project.id),
        );
        return (
          <article
            key={project.id}
            className={styles.dioramaCard}
            data-tier={tier}
            style={{ '--diorama-delay': `${120 + index * 60}ms` } as import('react').CSSProperties}
          >
            <header className={styles.dioramaHeader}>
              <h3 className={styles.dioramaName}>{project.name}</h3>
              <span className={styles.dioramaBadge} data-lifecycle={project.lifecycle}>
                <span className={styles.dioramaBadgeIcon} aria-hidden="true">
                  {LIFECYCLE_ICONS[project.lifecycle] ?? <IconMap size={14} />}
                </span>
                {labels.projectStates[project.lifecycle] ?? project.lifecycle}
              </span>
            </header>

            <p className={styles.dioramaSummary}>{project.summary}</p>

            <dl className={styles.dioramaStats}>
              <div>
                <dt>{labels.progress}</dt>
                <dd>{project.progressPercent}%</dd>
              </div>
              <div>
                <dt>{labels.version}</dt>
                <dd>{project.version}</dd>
              </div>
              <div>
                <dt>{labels.updated}</dt>
                <dd>{project.updatedAtLabel}</dd>
              </div>
            </dl>

            <div className={styles.dioramaProgress} aria-hidden="true">
              <span style={{ width: `${project.progressPercent}%` }} />
            </div>

            {tech.length > 0 ? (
              <ul className={styles.dioramaTech}>
                {tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}

            <div className={styles.dioramaLinks}>
              <a className={styles.dioramaLinkPrimary} href={project.detailHref}>
                {labels.details}
              </a>
              {project.liveHref ? (
                <a className={styles.dioramaLink} href={project.liveHref} target="_blank" rel="noreferrer">
                  {labels.visit}
                  <IconArrowUpRight size={13} />
                </a>
              ) : (
                <span className={styles.dioramaLinkUnavailable}>{labels.unavailableLive}</span>
              )}
              {project.evidenceHref ? (
                <a className={styles.dioramaLink} href={project.evidenceHref} target="_blank" rel="noreferrer">
                  {labels.evidence}
                  <IconArrowUpRight size={13} />
                </a>
              ) : (
                <span className={styles.dioramaLinkUnavailable}>{labels.unavailableEvidence}</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
