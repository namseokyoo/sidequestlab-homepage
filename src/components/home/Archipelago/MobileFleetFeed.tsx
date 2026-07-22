'use client';

import { useId } from 'react';

import { ProjectDetail } from './ProjectDetail';
import type { ArchipelagoCopy } from './copy';
import type { ArchipelagoProject } from './types';
import shellStyles from './Shell.module.css';
import styles from './Mobile.module.css';

type MobileFleetFeedProps = {
  readonly copy: ArchipelagoCopy;
  readonly projects: readonly ArchipelagoProject[];
  readonly selected: ArchipelagoProject;
  readonly onSelect: (id: string) => void;
};

export function MobileFleetFeed({
  copy,
  projects,
  selected,
  onSelect,
}: MobileFleetFeedProps) {
  const headingId = useId();
  const [fleetLead, fleetTail = ''] = copy.fleetSummary.split(copy.fleetSummaryPhrase);

  // ProjectDetail owns evidenceHref in the selected supplemental action group;
  // compact cards retain the minimum complete public story.
  return (
    <section className={styles.feed} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <p className={shellStyles.eyebrow}>{copy.fleetFeed}</p>
        <h2 id={headingId}>
          {fleetLead}<span className={shellStyles.phraseToken}>{copy.fleetSummaryPhrase}</span>
          {fleetTail}
        </h2>
      </div>
      <div className={styles.list}>
        {projects.map((project) => {
          const isSelected = project.id === selected.id;
          return (
            <article data-selected={isSelected} key={project.id}>
              <button
                className={styles.selectProject}
                data-project-selector={project.id}
                aria-expanded={isSelected}
                aria-pressed={project.id === selected.id}
                type="button"
                onClick={() => onSelect(project.id)}
              >
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.summary}</small>
                </span>
                <em>{copy.projectStates[project.lifecycle]}</em>
              </button>
              <div className={styles.cardSnapshot}>
                <p>{project.outcome}</p>
                <time>{copy.updated} · {project.updatedAtLabel}</time>
                <a href={project.detailHref}>{copy.details}</a>
              </div>
              {isSelected ? (
                <div className={styles.expansion}>
                  <ProjectDetail copy={copy} project={project} mode="supplemental" />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
