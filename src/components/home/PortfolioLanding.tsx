'use client';

import { useState } from 'react';
import EditorialHeroPanel from './EditorialHeroPanel';
import ProofCaseStrip from './ProofCaseStrip';
import { SystemCanvas } from './SystemCanvas';
import type { CanvasLocale, ProofStageId } from './SystemCanvas/canvasData';

type PortfolioLandingProps = {
  locale: string;
};

export default function PortfolioLanding({ locale }: PortfolioLandingProps) {
  const normalizedLocale: CanvasLocale = locale === 'en' ? 'en' : 'ko';
  const [activeStageId, setActiveStageId] = useState<ProofStageId>('qa');

  return (
    <div className="portfolio-landing">
      <section className="portfolio-reference-stage relative overflow-hidden border-y border-[rgba(243,238,229,0.13)]">
        <div className="absolute inset-0 editorial-page-texture" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1600px] lg:grid-cols-[31.5rem_minmax(0,1fr)]">
          <EditorialHeroPanel locale={normalizedLocale} />
          <div data-canvas-theme="graphite" className="relative flex min-w-0 flex-col bg-[var(--sql-charcoal)]">
            <SystemCanvas
              locale={normalizedLocale}
              activeStageId={activeStageId}
              onStageSelect={setActiveStageId}
            />
            <ProofCaseStrip locale={normalizedLocale} activeStageId={activeStageId} />
          </div>
        </div>
      </section>
    </div>
  );
}
