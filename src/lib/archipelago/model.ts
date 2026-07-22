export const PROJECT_LIFECYCLES = [
  'IDEA',
  'PLANNING',
  'DESIGNING',
  'BUILDING',
  'REVIEWING',
  'TESTING',
  'WAITING_FOR_RELEASE',
  'DEPLOYING',
  'OPERATING',
  'MAINTENANCE',
  'BLOCKED',
  'PAUSED',
  'ARCHIVED',
] as const;

export const WAYFARER_STATES = [
  'IDLE',
  'PLANNING',
  'WORKING',
  'REVIEWING',
  'TESTING',
  'WAITING_FOR_HUMAN',
  'BLOCKED',
  'COMPLETED',
  'MONITORING',
] as const;

export const PROJECT_HEALTH_STATES = [
  'NORMAL',
  'CAUTION',
  'AT_RISK',
  'BLOCKED',
  'UNKNOWN',
] as const;

export const WAYFARER_ROLES = [
  'CODE_ENGINEER',
  'QA_NAVIGATOR',
  'RESEARCHER',
  'OPERATOR',
] as const;

export const FLEET_GUIDE_ROLES = [
  'CODE_ENGINEER',
  'QA_NAVIGATOR',
] as const;

export const PROJECT_VISIBILITIES = ['PUBLIC', 'INTERNAL'] as const;
export const PUBLIC_DATA_MODES = ['DEMO', 'MANUAL_SNAPSHOT'] as const;

export type ProjectLifecycle = (typeof PROJECT_LIFECYCLES)[number];
export type WayfarerState = (typeof WAYFARER_STATES)[number];
export type ProjectHealth = (typeof PROJECT_HEALTH_STATES)[number];
export type WayfarerRole = (typeof WAYFARER_ROLES)[number];
export type FleetGuideRole = (typeof FLEET_GUIDE_ROLES)[number];
export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[number];
export type PublicDataMode = (typeof PUBLIC_DATA_MODES)[number];

export type LocalizedText = {
  readonly ko: string;
  readonly en: string;
};

export type CanonicalProject = {
  readonly id: string;
  readonly visibility: ProjectVisibility;
  readonly name: LocalizedText;
  readonly summary: LocalizedText;
};

export type CanonicalProjectCatalog = {
  readonly schemaVersion: '1.0';
  readonly projects: readonly CanonicalProject[];
};

export type ApprovedPublicWayfarer = {
  readonly id: string;
  readonly role: WayfarerRole;
  readonly state: WayfarerState;
};

export type ApprovedPublicProjectState = {
  readonly projectId: string;
  readonly lifecycle: ProjectLifecycle;
  readonly progressPercent: number;
  readonly version: string;
  readonly health: ProjectHealth;
  readonly crew: readonly ApprovedPublicWayfarer[];
};

export type ApprovedPublicSnapshot = {
  readonly schemaVersion: '1.0';
  readonly snapshotVersion: number;
  readonly dataMode: PublicDataMode;
  readonly approvalState: 'APPROVED';
  readonly publishedAt: string;
  readonly reviewAfter: string;
  readonly selectedProjectId: string | null;
  readonly projects: readonly ApprovedPublicProjectState[];
};

export type NormalizedPoint = {
  readonly x: number;
  readonly y: number;
};

export type NormalizedBox = NormalizedPoint & {
  readonly width: number;
  readonly height: number;
};

export type ProjectCrewAnchors = {
  readonly codeEngineer: NormalizedPoint;
  readonly qaNavigator: NormalizedPoint;
};

export type ProjectLandmarkAnchor = {
  readonly key: string;
  readonly anchor: NormalizedPoint;
};

export type ProjectEmblem = {
  readonly key: string;
  readonly anchor: NormalizedPoint;
};

export type ProjectPresentation = {
  readonly projectId: string;
  readonly order: number;
  readonly portKey: string;
  readonly islandKey: string;
  readonly routeKey: string;
  readonly focusBox: NormalizedBox;
  readonly focusScaleCap: number;
  readonly crewAnchors: ProjectCrewAnchors;
  readonly mobileCrewAnchors: ProjectCrewAnchors;
  readonly landmarkAnchors: readonly ProjectLandmarkAnchor[];
  readonly emblem: ProjectEmblem;
  readonly labelSafeRegion: NormalizedBox;
};

export type FleetPresentationManifest = {
  readonly schemaVersion: '1.0';
  readonly navigatorBoatKey: string;
  readonly projects: readonly ProjectPresentation[];
};

export type FleetProjectionFreshness = 'FRESH' | 'STALE' | 'EMPTY' | 'INVALID';
export type FleetActivityPolicy = 'ACTIVE' | 'STATIC';

export type FleetSemanticWayfarer = ApprovedPublicWayfarer & {
  readonly workSignifying: boolean;
};

export type FleetSemanticGuide = {
  readonly id: string;
  readonly role: FleetGuideRole;
  readonly state: WayfarerState;
  readonly source: 'SNAPSHOT' | 'SYMBOLIC';
  readonly workSignifying: boolean;
};

export type FleetSemanticProject = {
  readonly id: string;
  readonly name: LocalizedText;
  readonly summary: LocalizedText;
  readonly lifecycle: ProjectLifecycle;
  readonly progressPercent: number;
  readonly version: string;
  readonly health: ProjectHealth;
  readonly crew: readonly FleetSemanticWayfarer[];
  readonly guides: readonly FleetSemanticGuide[];
  readonly activityPolicy: FleetActivityPolicy;
  readonly presentation: ProjectPresentation;
};

export type FleetSemanticProjection = {
  readonly schemaVersion: '1.0';
  readonly snapshotVersion: number | null;
  readonly dataMode: PublicDataMode | null;
  readonly freshness: FleetProjectionFreshness;
  readonly publishedAt: string | null;
  readonly reviewAfter: string | null;
  readonly selectedProjectId: string | null;
  readonly navigatorBoatKey: string | null;
  readonly projects: readonly FleetSemanticProject[];
  readonly omittedInternalProjectCount: number;
};

export interface FleetSemanticAdapter<Output> {
  render(projection: FleetSemanticProjection): Output;
}
