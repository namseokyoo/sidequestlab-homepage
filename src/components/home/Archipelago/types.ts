import type {
  FleetSemanticGuide,
  FleetProjectionFreshness,
  ProjectHealth,
  ProjectLifecycle,
  ProjectPresentation,
} from '@/lib/archipelago/model';

export type ArchipelagoLocale = 'ko' | 'en';

export type ArchipelagoProject = {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly lifecycle: ProjectLifecycle;
  readonly progressPercent: number;
  readonly version: string;
  readonly health: ProjectHealth;
  readonly islandKey: string;
  readonly routeKey: string;
  readonly activityPolicy: 'ACTIVE' | 'STATIC';
  readonly guides: readonly FleetSemanticGuide[];
  readonly presentation: ProjectPresentation;
  readonly detailHref: string;
  readonly liveHref: string | null;
  readonly evidenceHref: string | null;
  readonly outcome: string;
  readonly updatedAtLabel: string;
};

export type ArchipelagoView = {
  readonly locale: ArchipelagoLocale;
  readonly freshness: FleetProjectionFreshness;
  readonly dataMode: 'DEMO' | 'MANUAL_SNAPSHOT' | null;
  readonly publishedAt: string | null;
  readonly navigatorBoatKey: string | null;
  readonly selectedProjectId: string | null;
  readonly projects: readonly ArchipelagoProject[];
};
