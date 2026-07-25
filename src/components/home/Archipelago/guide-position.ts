import type { FleetGuideRole } from '@/lib/archipelago/model';

import type { ArchipelagoProject } from './types';

export type GuidePlacementVariant = 'desktop' | 'mobile';

type CrewAnchor = ArchipelagoProject['presentation']['crewAnchors']['codeEngineer'];
type FocusBox = ArchipelagoProject['presentation']['focusBox'];

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getGuidePosition(
  codeEngineer: CrewAnchor,
  qaNavigator: CrewAnchor,
  mobileAnchors: ArchipelagoProject['presentation']['mobileCrewAnchors'],
  focus: FocusBox,
  role: FleetGuideRole,
  variant: GuidePlacementVariant,
): { readonly x: number; readonly y: number } {
  const anchor = role === 'CODE_ENGINEER'
    ? codeEngineer
    : qaNavigator;
  const localX = ((anchor.x - focus.x) / focus.width) * 100;
  const localY = ((anchor.y - focus.y) / focus.height) * 100;
  if (variant === 'mobile') {
    const mobileAnchor = role === 'CODE_ENGINEER'
      ? mobileAnchors.codeEngineer
      : mobileAnchors.qaNavigator;
    // The mobile art container is aspect-ratio locked to the artwork, so
    // container percentages equal art percentages; mobileCrewAnchors are
    // authored per island in full mobile art space. The old [56, 68] y clamp
    // forced every crew member into one band regardless of island.
    return {
      x: clamp(mobileAnchor.x * 100, 4, 96),
      y: clamp(mobileAnchor.y * 100, 4, 96),
    };
  }
  return {
    x: clamp(localX, 12, 88),
    y: clamp(localY, 24, 88),
  };
}
