'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  getAdjacentStages,
  WORKSHOP_STAGES,
  type LivingPortfolioViewModel,
} from '@/lib/living-workshop/model';
import WorkshopCharacter from './LivingWorkshop/WorkshopCharacter';
import styles from './LivingWorkshop/LivingWorkshop.module.css';

type PortfolioLandingProps = {
  locale: 'ko' | 'en';
  model: LivingPortfolioViewModel;
};

type ExperienceState = {
  selectedProjectId: string | null;
  animatedProjectId: string | null;
  selectionRevision: number;
  visitorSelected: boolean;
};

type ExperienceAction =
  | { type: 'select'; projectId: string }
  | { type: 'animate'; projectId: string }
  | { type: 'rest' };

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: 'change', listener: () => void) => void;
    removeEventListener?: (type: 'change', listener: () => void) => void;
  };
};

function experienceReducer(
  state: ExperienceState,
  action: ExperienceAction,
): ExperienceState {
  switch (action.type) {
    case 'select':
      if (state.selectedProjectId === action.projectId) return state;
      return {
        selectedProjectId: action.projectId,
        animatedProjectId: null,
        selectionRevision: state.selectionRevision + 1,
        visitorSelected: true,
      };
    case 'animate':
      if (state.selectedProjectId !== action.projectId) return state;
      return { ...state, animatedProjectId: action.projectId };
    case 'rest':
      if (state.animatedProjectId === null) return state;
      return { ...state, animatedProjectId: null };
  }
}

function ProjectWorkbenchProp({ projectId }: { projectId: string }) {
  return (
    <div
      className={styles.projectProp}
      data-project={projectId}
      aria-hidden="true"
    />
  );
}

export default function PortfolioLanding({
  locale,
  model,
}: PortfolioLandingProps) {
  const t = useTranslations('home.living_portfolio');
  const rootRef = useRef<HTMLElement>(null);
  const defaultProjectId =
    model.publishedDefaultProjectId ?? model.projects[0]?.id ?? null;
  const [state, dispatch] = useReducer(experienceReducer, {
    selectedProjectId: defaultProjectId,
    animatedProjectId: null,
    selectionRevision: 0,
    visitorSelected: false,
  });
  const [systemMotionBlocked, setSystemMotionBlocked] = useState(false);
  const [userAnimationOff, setUserAnimationOff] = useState(false);
  const [environmentReady, setEnvironmentReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [inViewport, setInViewport] = useState(false);
  const selectedProject =
    model.projects.find((project) => project.id === state.selectedProjectId) ??
    model.projects[0] ??
    null;
  const isFresh = model.freshness === 'fresh';
  const interactionEnabled = isFresh;
  const animationOff =
    !environmentReady || systemMotionBlocked || userAnimationOff;
  const motionEligible =
    environmentReady &&
    !animationOff &&
    pageVisible &&
    inViewport &&
    isFresh &&
    selectedProject !== null &&
    selectedProject.motion !== 'static';
  const animationPauseState = !environmentReady
    ? 'hydrating'
    : systemMotionBlocked
      ? 'system-preference'
      : userAnimationOff
        ? 'visitor-off'
        : !isFresh
          ? model.freshness
          : !pageVisible
            ? 'hidden'
            : !inViewport
              ? 'offscreen'
              : selectedProject?.motion === 'static'
                ? 'resting'
                : 'ready';

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as NavigatorWithConnection).connection;
    const readStoredPreference = () => {
      try {
        return window.localStorage.getItem('sidequestlab-workshop-motion') === 'off';
      } catch {
        return false;
      }
    };
    const updateSystemPreference = () => {
      setSystemMotionBlocked(
        reducedMotion.matches || connection?.saveData === true,
      );
    };
    const readyFrame = window.requestAnimationFrame(() => {
      updateSystemPreference();
      setUserAnimationOff(readStoredPreference());
      setPageVisible(document.visibilityState === 'visible');
      setEnvironmentReady(true);
    });

    const handleVisibility = () => {
      setPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', updateSystemPreference);
    connection?.addEventListener?.('change', updateSystemPreference);
    return () => {
      window.cancelAnimationFrame(readyFrame);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', updateSystemPreference);
      connection?.removeEventListener?.('change', updateSystemPreference);
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current || !('IntersectionObserver' in window)) {
      const fallbackFrame = window.requestAnimationFrame(() => setInViewport(true));
      return () => window.cancelAnimationFrame(fallbackFrame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry?.isIntersecting ?? false),
      { threshold: 0.15 },
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dispatch({ type: 'rest' });
    if (!motionEligible || !state.selectedProjectId) {
      return;
    }

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let cancelled = false;
    const projectId = state.selectedProjectId;
    const scheduleCycle = (delay: number) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          dispatch({ type: 'animate', projectId });
          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              dispatch({ type: 'rest' });
              scheduleCycle(9_000);
            }, 3_200),
          );
        }, delay),
      );
    };

    scheduleCycle(state.visitorSelected ? 9_000 : 1_200);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    motionEligible,
    state.selectedProjectId,
    state.selectionRevision,
    state.visitorSelected,
    selectedProject?.motion,
  ]);

  const currentStages = useMemo(
    () => (selectedProject ? getAdjacentStages(selectedProject.stage) : []),
    [selectedProject],
  );
  const motionActive =
    state.animatedProjectId === selectedProject?.id &&
    selectedProject?.motion !== 'static';
  const motionCount = motionActive ? 1 : 0;
  const formattedDate = model.updatedOn
    ? new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Seoul',
      }).format(new Date(`${model.updatedOn}T12:00:00+09:00`))
    : null;

  const toggleAnimation = () => {
    if (!environmentReady || systemMotionBlocked) return;
    const next = !userAnimationOff;
    setUserAnimationOff(next);
    try {
      window.localStorage.setItem(
        'sidequestlab-workshop-motion',
        next ? 'off' : 'on',
      );
    } catch {
      // The in-memory visitor choice still applies when storage is unavailable.
    }
    if (next) dispatch({ type: 'rest' });
  };

  const projectNavigation = model.cards.length > 0 && (
    <nav className={styles.cards} aria-label={t('selector_label')}>
      {model.cards.map((card, index) => {
        const activity = model.projects.find((project) => project.id === card.id);
        const selected = interactionEnabled && activity?.id === selectedProject?.id;
        return (
          <article
            key={card.id}
            className={styles.projectCard}
            data-selected={selected ? 'true' : 'false'}
          >
            {activity && interactionEnabled ? (
              <button
                type="button"
                className={styles.selector}
                data-project={card.id}
                aria-pressed={selected}
                aria-label={card.name}
                onClick={() => dispatch({ type: 'select', projectId: card.id })}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
              </button>
            ) : (
              <span className={styles.selector} data-project={card.id} aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>
            )}
            <div className={styles.cardCopy}>
              <span className={styles.cardName}>{card.name}</span>
              <span className={styles.cardDescription}>{card.description}</span>
              {card.stage && card.activityMode && card.update && (
                <span className={styles.cardPublicState}>
                  <span className={styles.cardActivity}>
                    {t(`stages.${card.stage}`)} · {t(`activity_modes.${card.activityMode}`)}
                  </span>
                  <span className={styles.cardUpdate}>{card.update}</span>
                </span>
              )}
            </div>
            <Link
              href={card.detailHref as '/projects'}
              className={styles.detailsLink}
            >
              {t('project_details')} →
            </Link>
          </article>
        );
      })}
      <Link href="/projects" className={styles.viewAll}>
        {t('view_all_projects')} →
      </Link>
    </nav>
  );

  return (
    <section
      ref={rootRef}
      className={styles.landing}
      data-workshop-motion={motionActive ? selectedProject?.motion : 'rest'}
      data-moving-count={motionCount}
      data-work-signifying-count={motionCount}
      data-animation-ready={motionEligible ? 'true' : 'false'}
      data-animation-pause-state={animationPauseState}
      data-workshop-freshness={model.freshness}
    >
      <div className={styles.layout}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t('eyebrow')}</p>
            <h1 className={styles.title}>{t('title')}</h1>
            <p className={styles.intro}>{t('body')}</p>
          </div>
          <div className={styles.heroArt} aria-hidden="true" />
        </header>

        {projectNavigation}

        <div
          className={styles.workshop}
          aria-label={t('workshop_label')}
        >
          <div className={styles.workshopShell}>
            <div className={styles.workshopHeader}>
              <div className={styles.labNow}>
                <span className={styles.statusLight} aria-hidden="true" />
                <div>
                  <p className={styles.microLabel}>SIDEQUESTLAB WORKSHOP</p>
                  <h2 className={styles.workshopTitle} aria-live="polite">
                    {t('workshop_label')}
                  </h2>
                  <p className={styles.headerDisclosure}>{t('disclosure')}</p>
                </div>
              </div>
              <div className={styles.headerControls}>
                <span className={styles.snapshotTag}>
                  {model.freshness === 'fresh'
                    ? t('fresh')
                    : model.freshness === 'stale'
                      ? t('stale')
                      : model.freshness === 'empty'
                        ? t('empty_snapshot')
                        : t('invalid_snapshot')}
                  {formattedDate ? ` · ${t('updated', { date: formattedDate })}` : ''}
                </span>
                <button
                  type="button"
                  className={styles.motionToggle}
                  data-off={animationOff ? 'true' : 'false'}
                  aria-pressed={!animationOff}
                  disabled={!environmentReady || systemMotionBlocked}
                  aria-label={
                    animationOff
                      ? t('turn_animation_on')
                      : t('turn_animation_off')
                  }
                  title={animationOff ? t('animation_off') : t('animation_on')}
                  onClick={toggleAnimation}
                >
                  {animationOff ? t('animation_off') : t('animation_on')}
                </button>
              </div>
            </div>

            {selectedProject ? (
              <>
                <div className={styles.scene}>
                  <div className={styles.overheadLamp} aria-hidden="true" />
                  <div className={styles.bays} aria-hidden="true">
                    {model.projects.map((project, index) => {
                      const selected = project.id === selectedProject.id;
                      return (
                        <div
                          key={project.id}
                          className={styles.bay}
                          data-selected={selected ? 'true' : 'false'}
                        >
                          <span className={styles.bayNumber}>
                            BAY {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={styles.bayStage}>
                            {t(`stages.${project.stage}`)}
                          </span>
                          <div className={styles.workbench}>
                            <ProjectWorkbenchProp projectId={project.id} />
                          </div>
                          {selected && (
                            <WorkshopCharacter
                              motion={project.motion}
                              active={motionActive}
                            />
                          )}
                          <p className={styles.bayLabel}>{project.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.stageArea}>
                  <div className={styles.stageIntro}>
                    <span>{t('stage_coordinate')}</span>
                    <span>
                      {t('selected_context', {
                        current:
                          model.projects.findIndex(
                            (project) => project.id === selectedProject.id,
                          ) + 1,
                        total: model.projects.length,
                      })}
                      {' · '}
                      {t(`stages.${selectedProject.stage}`)}
                    </span>
                  </div>
                  <ol className={styles.stageMap}>
                    {WORKSHOP_STAGES.map((stage) => (
                      <li
                        key={stage}
                        className={styles.stagePoint}
                        data-current={isFresh && selectedProject.stage === stage ? 'true' : 'false'}
                      >
                        <span className={styles.stageMarkerTrack} aria-hidden="true">
                          {model.projects
                            .filter((project) => project.stage === stage)
                            .map((project) => {
                              const markerIndex = model.projects.findIndex(
                                (candidate) => candidate.id === project.id,
                              );
                              return (
                                <span
                                  key={project.id}
                                  className={styles.projectMarker}
                                  data-marker={String(markerIndex + 1)}
                                  data-selected={isFresh && project.id === selectedProject.id ? 'true' : 'false'}
                                >
                                  {markerIndex + 1}
                                </span>
                              );
                            })}
                        </span>
                        <span>{t(`stages.${stage}`)}</span>
                      </li>
                    ))}
                  </ol>
                  <ol className={styles.stageMapMobile}>
                    {currentStages.map((stage) => (
                      <li
                        key={stage}
                        className={styles.stagePoint}
                        data-current={isFresh && selectedProject.stage === stage ? 'true' : 'false'}
                      >
                        <span className={styles.stageDot} aria-hidden="true" />
                        <span>{t(`stages.${stage}`)}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className={styles.activityPanel} aria-live="polite">
                  <div className={styles.activityCopy}>
                    <p className={styles.activityHeading}>
                      {selectedProject.name} · {t(`stages.${selectedProject.stage}`)}
                    </p>
                    <p className={styles.activityText}>
                      {model.freshness === 'stale'
                        ? t('stale_notice')
                        : selectedProject.update}
                    </p>
                  </div>
                  {isFresh && (
                    <a
                      className={styles.serviceLink}
                      href={selectedProject.serviceHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedProject.serviceCta} ↗
                    </a>
                  )}
                </div>

                {model.notes.length > 0 && (
                  <aside className={styles.labNotes} aria-labelledby="living-portfolio-lab-notes">
                    <p id="living-portfolio-lab-notes" className={styles.microLabel}>
                      {t('lab_notes')}
                    </p>
                    <ul>
                      {model.notes.map((note) => (
                        <li key={note.id}>
                          <span className={styles.noteMeta}>
                            {note.date} · {note.projectName}
                          </span>
                          <span>{note.text}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </>
            ) : (
              <div className={styles.fallback}>
                <div className={styles.fallbackIcon} aria-hidden="true" />
                <h2>
                  {model.freshness === 'invalid'
                    ? t('invalid_title')
                    : t('empty_title')}
                </h2>
                <p>
                  {model.freshness === 'invalid'
                    ? t('invalid_body')
                    : t('empty_body')}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
