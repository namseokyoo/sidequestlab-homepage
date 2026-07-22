'use client';

import { useEffect, useRef } from 'react';

import type { FleetSemanticGuide } from '@/lib/archipelago/model';

import type { ArchipelagoCopy } from './copy';
import { getGuideDisplayState } from './state';
import type { ArchipelagoProject } from './types';
import shellStyles from './Shell.module.css';
import styles from './Dialog.module.css';

type CrewGuideDialogProps = {
  readonly copy: ArchipelagoCopy;
  readonly guide: FleetSemanticGuide | null;
  readonly project: ArchipelagoProject | null;
  readonly simulated: boolean;
  readonly onClose: () => void;
};

function roleName(role: FleetSemanticGuide['role']): string {
  return role === 'CODE_ENGINEER' ? 'Code Engineer' : 'QA Navigator';
}

function roleDescription(role: FleetSemanticGuide['role'], locale: 'ko' | 'en'): string {
  if (role === 'CODE_ENGINEER') {
    return locale === 'ko'
      ? '공개된 제작 상태를 설명하는 제품 구현 안내자입니다.'
      : 'A product-building guide that explains the published implementation state.';
  }
  return locale === 'ko'
    ? '공개된 검증 상태를 설명하는 품질 안내자입니다.'
    : 'A quality guide that explains the published verification state.';
}

export function CrewGuideDialog({
  copy,
  guide,
  project,
  simulated,
  onClose,
}: CrewGuideDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = guide !== null && project !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const title = guide === null || project === null
    ? copy.guideTitle
    : `${roleName(guide.role)} · ${project.name}`;
  const displayState = guide === null ? null : getGuideDisplayState(guide, simulated);
  const stateLabel = displayState === 'OBSERVING_PUBLIC'
    ? copy.observing
    : displayState === 'NO_PUBLIC_ACTIVITY'
      ? copy.noCrew
      : displayState === null
        ? ''
        : copy.guideStates[displayState];
  const sourceLabel = simulated
    ? copy.simulatedState
    : guide?.source === 'SNAPSHOT'
      ? copy.publishedSnapshot
      : copy.symbolicGuides;

  return (
    <dialog
      className={styles.dialog}
      ref={dialogRef}
      aria-labelledby="arch-guide-title"
      onClose={onClose}
      onCancel={onClose}
    >
      <button className={styles.close} type="button" onClick={onClose}>
        <span aria-hidden="true">×</span>
        <span className="sr-only">{copy.close}</span>
      </button>
      <p className={shellStyles.eyebrow}>AI GUIDE</p>
      <h2 id="arch-guide-title"><span className={styles.roleToken}>{title}</span></h2>
      {guide === null || project === null ? null : (
        <>
          <p>{roleDescription(guide.role, project.detailHref.startsWith('/ko/') ? 'ko' : 'en')}</p>
          <dl className={styles.context}>
            <div><dt>{copy.selected}</dt><dd>{project.name}</dd></div>
            <div><dt>{copy.activity}</dt><dd>{stateLabel}</dd></div>
            <div>
              <dt>{copy.proofMode}</dt>
              <dd>{sourceLabel}</dd>
            </div>
          </dl>
        </>
      )}
      <button className={styles.done} type="button" onClick={onClose}>{copy.close}</button>
    </dialog>
  );
}
