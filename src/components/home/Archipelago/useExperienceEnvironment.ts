'use client';

import { useEffect, useState } from 'react';

import type { DataTransferMode } from '@/lib/archipelago/motion-policy';

type ExperienceEnvironment = {
  readonly dataTransferMode: DataTransferMode;
  readonly documentVisible: boolean;
  readonly isDesktop: boolean;
  readonly prefersReducedMotion: boolean;
};

function readSaveData(): DataTransferMode {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'STANDARD';
  }
  const connection: unknown = Reflect.get(navigator, 'connection');
  if (typeof connection !== 'object' || connection === null || !('saveData' in connection)) {
    return 'STANDARD';
  }
  return Reflect.get(connection, 'saveData') === true ? 'SAVE_DATA' : 'STANDARD';
}

export function useExperienceEnvironment(): ExperienceEnvironment {
  const [environment, setEnvironment] = useState<ExperienceEnvironment>({
    dataTransferMode: 'STANDARD',
    documentVisible: true,
    isDesktop: false,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setEnvironment({
        dataTransferMode: readSaveData(),
        documentVisible: document.visibilityState === 'visible',
        isDesktop: desktopQuery.matches,
        prefersReducedMotion: reducedQuery.matches,
      });
    };

    update();
    desktopQuery.addEventListener('change', update);
    reducedQuery.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      desktopQuery.removeEventListener('change', update);
      reducedQuery.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return environment;
}
