import type { ArchipelagoCopy } from './copy';
import type { ArchipelagoView } from './types';
import styles from './Shell.module.css';

type ProofHeroProps = {
  readonly copy: ArchipelagoCopy;
  readonly view: ArchipelagoView;
  readonly preview: boolean;
};

export function ProofHero({ copy, view, preview }: ProofHeroProps) {
  const activeCrew = view.projects.reduce(
    (count, project) => count + project.guides.filter((guide) => guide.source === 'SNAPSHOT').length,
    0,
  );
  const [introLead, introTail = ''] = copy.intro.split(copy.introPhrase);

  return (
    <header className={styles.proofHero}>
      <div className={styles.proofCopy}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.titleLead} <span>{copy.titleTail}</span></h1>
        <p className={styles.intro}>
          {introLead}<span className={styles.phraseToken}>{copy.introPhrase}</span>{' '}
          <span className={styles.phraseToken}>{introTail.trim()}</span>
        </p>
        <p className={styles.truth}>{copy.truth}</p>
        {preview ? <p className={styles.previewDisclosure}>{copy.previewDisclosure}</p> : null}
      </div>
      <dl className={styles.proofMetrics} aria-label={copy.truth}>
        <div>
          <dt>{copy.projects}</dt>
          <dd>{view.projects.length}</dd>
        </div>
        <div>
          <dt>{copy.activeCrew}</dt>
          <dd>{activeCrew}</dd>
        </div>
        <div>
          <dt>{copy.proofMode}</dt>
          <dd>{view.dataMode ?? '—'}</dd>
        </div>
      </dl>
    </header>
  );
}
