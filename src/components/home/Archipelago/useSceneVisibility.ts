'use client';

import { useEffect, useRef, useState } from 'react';

export function useSceneVisibility<T extends HTMLElement>() {
  const sceneRef = useRef<T>(null);
  const [sceneVisible, setSceneVisible] = useState(false);

  useEffect(() => {
    const scene = sceneRef.current;
    if (scene === null || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setSceneVisible(entry?.isIntersecting === true),
      { threshold: 0.01 },
    );
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return { sceneRef, sceneVisible } as const;
}
