import canonicalInput from '@/data/archipelago/canonical-projects.v1.json';
import manifestInput from '@/data/archipelago/presentation-manifest.v1.json';
import snapshotInput from '@/data/archipelago/approved-public-snapshot.v1.json';
import { buildFleetSemanticProjection } from '@/lib/archipelago/projection';
import { sanitizePublicHttpsUrl } from '@/lib/archipelago/public-links';
import { projects as projectCatalog } from '@/lib/projects';

import type {
  ArchipelagoLocale,
  ArchipelagoProject,
  ArchipelagoView,
} from './types';

const GITHUB_PUBLIC_HOSTS = new Set(['github.com']);

function formatPublicDate(value: string, locale: ArchipelagoLocale): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function resolvePublicProjectData(id: string, locale: ArchipelagoLocale) {
  const project = projectCatalog.find((candidate) => candidate.id === id);
  const updatedAt = project?.showcase?.updatedAt ?? project?.startDate;
  return {
    detailHref: `/${locale}/projects/${id}`,
    liveHref: sanitizePublicHttpsUrl(project?.url),
    evidenceHref: sanitizePublicHttpsUrl(
      project?.github,
      GITHUB_PUBLIC_HOSTS,
    ),
    outcome: project?.showcase?.headline[locale]
      ?? project?.description[locale]
      ?? '',
    updatedAtLabel: updatedAt === undefined ? '—' : formatPublicDate(updatedAt, locale),
  };
}

export function buildArchipelagoView(
  locale: ArchipelagoLocale,
  now: Date,
): ArchipelagoView {
  const projection = buildFleetSemanticProjection({
    canonicalInput,
    snapshotInput,
    manifestInput,
    now,
  });
  const projects: readonly ArchipelagoProject[] = projection.projects.map(
    (project) => ({
      id: project.id,
      name: project.name[locale],
      summary: project.summary[locale],
      lifecycle: project.lifecycle,
      progressPercent: project.progressPercent,
      version: project.version,
      health: project.health,
      islandKey: project.presentation.islandKey,
      routeKey: project.presentation.routeKey,
      activityPolicy: project.activityPolicy,
      guides: project.guides,
      presentation: project.presentation,
      ...resolvePublicProjectData(project.id, locale),
    }),
  );

  return {
    locale,
    freshness: projection.freshness,
    dataMode: projection.dataMode,
    publishedAt: projection.publishedAt,
    navigatorBoatKey: projection.navigatorBoatKey,
    selectedProjectId: projection.selectedProjectId,
    projects,
  };
}
