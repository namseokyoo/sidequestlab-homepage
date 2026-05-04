'use client';

import { useEffect, useMemo, useState } from 'react';
import CanvasDetailPanel from './CanvasDetailPanel';
import CanvasEdgeLayer from './CanvasEdgeLayer';
import CanvasNode from './CanvasNode';
import CanvasThemeSwitcher from './CanvasThemeSwitcher';
import { canvasNodes, getCanvasNode, type CanvasLocale } from './canvasData';
import { defaultCanvasTheme, isCanvasThemeId, type CanvasThemeId } from './canvasThemes';

type SystemCanvasProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    eyebrow: 'Living Systems Canvas',
    title: 'AI Operations Map',
    subtitle: '아이디어가 공개 증거로 정리되기까지의 운영 경로를 탐색합니다.',
    hint: '노드를 선택하면 증거 경로가 바뀝니다.',
  },
  en: {
    eyebrow: 'Living Systems Canvas',
    title: 'AI Operations Map',
    subtitle: 'Explore how ideas move through build, QA, release, recovery, and proof.',
    hint: 'Select a node to inspect the proof path.',
  },
};

export default function SystemCanvas({ locale }: SystemCanvasProps) {
  const [activeNodeId, setActiveNodeId] = useState('qa');
  const [theme, setTheme] = useState<CanvasThemeId>(defaultCanvasTheme);
  const activeNode = useMemo(() => getCanvasNode(activeNodeId), [activeNodeId]);
  const text = copy[locale];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem('sidequestlab.canvasTheme');
      if (isCanvasThemeId(saved)) {
        setTheme(saved);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleThemeChange = (nextTheme: CanvasThemeId) => {
    setTheme(nextTheme);
    window.localStorage.setItem('sidequestlab.canvasTheme', nextTheme);
  };

  return (
    <section
      data-canvas-theme={theme}
      className="system-canvas-shell relative min-h-[680px] overflow-hidden rounded-[2rem] border shadow-2xl shadow-black/10"
      aria-label={text.title}
    >
      <div className="absolute inset-0 system-canvas-grid" aria-hidden="true" />
      <div className="absolute inset-0 system-canvas-grain" aria-hidden="true" />
      <div className="relative z-10 flex min-h-[680px] flex-col p-5 sm:p-6 lg:p-7">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--canvas-accent)]">
              {text.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--canvas-text)] sm:text-3xl">
              {text.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--canvas-muted)]">
              {text.subtitle}
            </p>
          </div>
          <CanvasThemeSwitcher value={theme} onChange={handleThemeChange} />
        </header>

        <div className="mt-6 grid flex-1 gap-5 xl:grid-cols-[1fr_260px]">
          <div className="system-canvas-map relative min-h-[470px] overflow-hidden rounded-[1.5rem] border">
            <CanvasEdgeLayer activeNodeId={activeNodeId} />
            <div className="hidden lg:block">
              {canvasNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <CanvasNode
                    node={node}
                    locale={locale}
                    active={node.id === activeNodeId}
                    onSelect={setActiveNodeId}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {canvasNodes.map((node) => (
                <CanvasNode
                  key={node.id}
                  node={node}
                  locale={locale}
                  active={node.id === activeNodeId}
                  onSelect={setActiveNodeId}
                />
              ))}
            </div>

            <div className="absolute bottom-4 left-4 hidden rounded-full border border-[var(--canvas-border)] bg-[var(--canvas-surface)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--canvas-muted)] backdrop-blur-sm md:block">
              {text.hint}
            </div>
          </div>

          <div className="space-y-4">
            <CanvasDetailPanel node={activeNode} locale={locale} />
            <div className="rounded-3xl border border-[var(--canvas-border)] bg-[var(--canvas-surface)] p-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--canvas-muted)]">
              <div className="mb-3 flex items-center justify-between text-[var(--canvas-text)]">
                <span>Route Check</span>
                <span className="h-2 w-2 rounded-full bg-[var(--canvas-accent)]" />
              </div>
              <ol className="space-y-2 leading-relaxed">
                <li>01 scope recorded</li>
                <li>02 claim audit required</li>
                <li>03 lint/build gate</li>
                <li>04 public proof aligned</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
