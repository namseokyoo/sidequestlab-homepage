import type { ArchipelagoCopy } from './copy';
import styles from './Shell.module.css';

export function OverviewPrompt({ copy }: { readonly copy: ArchipelagoCopy }) {
  return (
    <div className={styles.overviewPrompt}>
      <p className={styles.eyebrow}>{copy.projects}</p>
      <h2>{copy.choose}</h2>
      <p>{copy.truth}</p>
    </div>
  );
}
