import 'server-only';

import publicLabActivity from '@/data/public-lab-activity.json';
import { projects } from '@/lib/projects';
import {
  buildWorkshopModel,
  type LivingPortfolioCard,
  type LivingPortfolioViewModel,
} from './model';

const WORKSHOP_CARD_IDS = ['displaylab', 'booksalon', 'nbbang'] as const;

export function getLivingPortfolioViewModel(
  locale: 'ko' | 'en',
  now = new Date(),
): LivingPortfolioViewModel {
  const publicProjects = projects.filter(
    (project) => project.category !== 'internal',
  );
  const canonicalById = new Map(
    publicProjects.map((project) => [project.id, project]),
  );
  const model = buildWorkshopModel(publicLabActivity, publicProjects, now);
  const activityById = new Map(
    model.projects.map((activity) => [activity.id, activity]),
  );
  const cards: LivingPortfolioCard[] = WORKSHOP_CARD_IDS.flatMap((id) => {
    const project = canonicalById.get(id);
    if (!project) return [];
    const activity = activityById.get(id);
    return [
      {
        id: project.id,
        name: project.name[locale],
        description: project.description[locale],
        detailHref: `/projects/${project.id}`,
        stage: activity?.stage,
        activityMode: activity?.activityMode,
        update: activity?.update[locale],
      },
    ];
  });

  if (model.freshness === 'invalid' || model.freshness === 'empty') {
    return {
      freshness: model.freshness,
      updatedOn: model.updatedOn,
      publishedDefaultProjectId: null,
      projects: [],
      cards,
      notes: [],
    };
  }

  return {
    freshness: model.freshness,
    updatedOn: model.updatedOn,
    publishedDefaultProjectId: model.publishedDefaultProjectId,
    cards,
    projects: model.projects.flatMap((entry) => {
      const canonical = canonicalById.get(entry.id);
      if (!canonical) return [];
      return [
        {
          id: entry.id,
          name: canonical.name[locale],
          description: canonical.description[locale],
          update: entry.update[locale],
          stage: entry.stage,
          activityMode: entry.activityMode,
          motion: entry.motion,
          serviceHref: canonical.showcase?.cta.href ?? canonical.url,
          serviceCta:
            canonical.showcase?.cta.label[locale] ??
            (locale === 'ko' ? '서비스 열기' : 'Open service'),
          detailHref: `/projects/${canonical.id}`,
        },
      ];
    }),
    notes: model.notes.map((note) => ({
      id: note.id,
      projectId: note.projectId,
      projectName: note.projectName[locale],
      date: note.date,
      kind: note.kind,
      text: note.text[locale],
      href: note.href,
    })),
  };
}
