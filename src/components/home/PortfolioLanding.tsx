import { TOTAL_PROJECT_COUNT, SERVICE_COUNT } from '@/lib/stats';
import EditorialHeroPanel from './EditorialHeroPanel';
import ProofCaseStrip from './ProofCaseStrip';
import { SystemCanvas } from './SystemCanvas';
import type { CanvasLocale } from './SystemCanvas/canvasData';

type PortfolioLandingProps = {
  locale: string;
};

export default function PortfolioLanding({ locale }: PortfolioLandingProps) {
  const normalizedLocale: CanvasLocale = locale === 'en' ? 'en' : 'ko';

  return (
    <div className="portfolio-landing">
      <section className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="absolute inset-0 editorial-page-texture" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-5 xl:grid-cols-[0.38fr_0.62fr]">
          <EditorialHeroPanel locale={normalizedLocale} />
          <SystemCanvas locale={normalizedLocale} />
        </div>
      </section>
      <ProofCaseStrip
        locale={normalizedLocale}
        projectCount={TOTAL_PROJECT_COUNT}
        serviceCount={SERVICE_COUNT}
      />
    </div>
  );
}
