'use client';

import { useMemo, useState } from 'react';
import CanvasEdgeLayer from './CanvasEdgeLayer';
import CanvasNode from './CanvasNode';
import { canvasNodes, getCanvasNode, type CanvasLocale } from './canvasData';

type SystemCanvasProps = {
  locale: CanvasLocale;
};

const copy = {
  ko: {
    eyebrow: 'LIVING SYSTEMS MAP',
    instruction: 'DRAG NODES TO EXPLORE PATHWAYS',
    aboutTitle: 'ABOUT THIS PATH',
    about: 'This pathway represents the onboarding optimization loop from experiment to deployment and monitoring.',
    decisionTitle: 'Decision Log',
    decisionMeta: '#1247',
    decisionEyebrow: 'MODEL EVAL UPDATE',
    decisionBody: 'Switched ranking model based on offline eval results.',
    decisionTime: 'MAY 20, 2025   11:42',
    decisionOwner: 'J. KIM',
    decisionCta: 'VIEW DETAILS',
    tools: ['Select', 'Pan', 'Zoom', 'Frame'],
  },
  en: {
    eyebrow: 'LIVING SYSTEMS MAP',
    instruction: 'DRAG NODES TO EXPLORE PATHWAYS',
    aboutTitle: 'ABOUT THIS PATH',
    about: 'This pathway represents the onboarding optimization loop from experiment to deployment and monitoring.',
    decisionTitle: 'Decision Log',
    decisionMeta: '#1247',
    decisionEyebrow: 'MODEL EVAL UPDATE',
    decisionBody: 'Switched ranking model based on offline eval results.',
    decisionTime: 'MAY 20, 2025   11:42',
    decisionOwner: 'J. KIM',
    decisionCta: 'VIEW DETAILS',
    tools: ['Select', 'Pan', 'Zoom', 'Frame'],
  },
};

const toolbarIcons = ['⌁', '☝', '⌕', '□'];

export default function SystemCanvas({ locale }: SystemCanvasProps) {
  const [activeNodeId, setActiveNodeId] = useState('qa');
  const activeNode = useMemo(() => getCanvasNode(activeNodeId), [activeNodeId]);
  const text = copy[locale];

  return (
    <section
      data-canvas-theme="graphite"
      className="system-canvas-shell reference-system-canvas relative min-h-[640px] flex-1 overflow-hidden border-b border-[rgba(243,238,229,0.12)]"
      aria-label="Living Systems Map"
    >
      <div className="absolute inset-0 system-canvas-grid" aria-hidden="true" />
      <div className="absolute inset-0 system-canvas-grain" aria-hidden="true" />
      <div className="absolute inset-0 reference-orbit-lines" aria-hidden="true" />

      <header className="relative z-20 flex items-center gap-5 px-7 pt-8 font-mono text-[10px] uppercase tracking-[0.17em]">
        <span className="inline-flex items-center gap-2 font-semibold text-[var(--canvas-text)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--canvas-accent)]" />
          {text.eyebrow}
        </span>
        <span className="text-[rgba(243,238,229,0.74)]">{text.instruction}</span>
      </header>

      <div className="relative z-10 min-h-[610px] px-7 pb-7 pt-2">
        <div className="hidden lg:block">
          <CanvasEdgeLayer activeNodeId={activeNodeId} />
        </div>

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

        <div className="grid gap-3 pt-8 lg:hidden">
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

        <aside className="absolute right-[13%] top-[14%] hidden w-52 rounded border border-[rgba(243,238,229,0.14)] bg-[rgba(28,27,25,0.86)] p-4 shadow-2xl shadow-black/30 backdrop-blur md:block">
          <div className="flex items-center justify-between border-b border-[rgba(243,238,229,0.1)] pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--canvas-text)]">
              <span className="text-[var(--canvas-muted)]">⌘</span>
              {text.decisionTitle}
            </div>
            <span className="font-mono text-[10px] font-semibold text-[rgba(243,238,229,0.72)]">{text.decisionMeta}</span>
          </div>
          <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--canvas-text)]">{text.decisionEyebrow}</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--canvas-muted)]">{text.decisionBody}</p>
          <div className="mt-4 border-y border-[rgba(243,238,229,0.12)] py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(243,238,229,0.74)]">
            <p>{text.decisionTime}</p>
            <p className="mt-1">{text.decisionOwner}</p>
          </div>
          <button className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--canvas-accent)]">
            {text.decisionCta} →
          </button>
        </aside>

        <aside className="absolute bottom-[24%] right-[4.2%] hidden w-56 rounded border border-[rgba(243,238,229,0.13)] bg-[rgba(28,27,25,0.72)] p-4 backdrop-blur md:block">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(243,238,229,0.66)]">{text.aboutTitle}</p>
            <span className="text-[rgba(243,238,229,0.68)]">×</span>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[rgba(243,238,229,0.76)]">{text.about}</p>
        </aside>

        <div className="absolute right-5 top-[22%] hidden overflow-hidden rounded border border-[rgba(243,238,229,0.12)] bg-[rgba(28,27,25,0.72)] backdrop-blur md:block">
          {toolbarIcons.map((icon, index) => (
            <button
              key={icon}
              type="button"
              aria-label={text.tools[index]}
              className={`block h-10 w-10 border-b border-[rgba(243,238,229,0.08)] text-sm ${index === 0 ? 'text-[var(--canvas-accent)]' : 'text-[rgba(243,238,229,0.72)]'} last:border-b-0`}
            >
              {icon}
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 right-7 hidden h-[4.2rem] w-[10.5rem] rounded border border-[rgba(243,238,229,0.12)] bg-[rgba(243,238,229,0.05)] p-2 md:block">
          <div className="relative h-full w-full overflow-hidden rounded-sm bg-[rgba(10,10,9,0.58)]">
            <div className="absolute inset-2 border border-[var(--canvas-accent)]" />
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                className="absolute h-1.5 w-3 bg-[rgba(243,238,229,0.22)]"
                style={{ left: `${8 + (index % 6) * 14}%`, top: `${15 + Math.floor(index / 6) * 26}%` }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-[18%] left-[45%] hidden rounded-full border border-[rgba(243,238,229,0.2)] bg-[rgba(10,10,9,0.82)] px-3 py-1 font-mono text-[10px] font-semibold text-[rgba(243,238,229,0.72)] md:block">
          {activeNode.copy[locale].eyebrow}
        </div>
      </div>
    </section>
  );
}
