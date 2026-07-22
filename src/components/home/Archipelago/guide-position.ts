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
    return {
      x: clamp(mobileAnchor.x * 100, 12, 88),
      y: clamp(mobileAnchor.y * 100, 56, 68),
    };
  }
  return {
    x: clamp(localX, 12, 88),
    y: clamp(localY, 24, 88),
  };
}
