/**
 * Island configuration types and validator.
 * Schema-only — not wired into runtime rendering (WS9 extension point).
 */

export type IslandConfigPoint = {
  readonly x: number;
  readonly y: number;
};

export type IslandConfigPosition = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
};

export type IslandConfigLandmark = {
  readonly type: string;
  readonly spritePath: string;
  readonly anchorOffset: IslandConfigPoint;
};

export type IslandConfigVegetation = {
  readonly trees: number;
  readonly bushes: number;
  readonly flowers: number;
  readonly tufts: number;
};

export type IslandConfigCoastal = {
  readonly shells: number;
  readonly conchs: number;
  readonly tidepools: number;
  readonly rocks: number;
};

export type IslandConfigCliff = {
  readonly vines: number;
  readonly mossPatches: number;
};

export type IslandConfigCompanion = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
};

export type IslandConfig = {
  readonly id: string;
  readonly position: IslandConfigPosition;
  readonly landmark: IslandConfigLandmark;
  readonly vegetation: IslandConfigVegetation;
  readonly coastal: IslandConfigCoastal;
  readonly cliff: IslandConfigCliff;
  readonly smokeSources: readonly IslandConfigPoint[];
  readonly spriteOverrides: Readonly<Record<string, string>>;
  readonly walkCycleSheet: string | null;
  readonly companion: IslandConfigCompanion | null;
};

export type IslandConfigFile = {
  readonly version: number;
  readonly islands: readonly IslandConfig[];
};

export type ParseResult =
  | { readonly ok: true; readonly config: IslandConfigFile }
  | { readonly ok: false; readonly errors: readonly string[] };

/**
 * Validate and parse a raw JSON object as IslandConfigFile.
 * No external dependencies — hand-rolled structural validation.
 */
export function parseIslandConfig(raw: unknown): ParseResult {
  const errors: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errors: ['Root must be an object'] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.version !== 'number' || obj.version < 1) {
    errors.push('version must be a positive integer');
  }

  if (!Array.isArray(obj.islands) || obj.islands.length === 0) {
    errors.push('islands must be a non-empty array');
    return { ok: false, errors };
  }

  const validIds = new Set(['displaylab', 'booksalon', 'nbbang']);

  for (let i = 0; i < obj.islands.length; i++) {
    const island = obj.islands[i] as Record<string, unknown>;
    const prefix = `islands[${i}]`;

    if (typeof island.id !== 'string' || !validIds.has(island.id)) {
      errors.push(`${prefix}.id must be one of: displaylab, booksalon, nbbang`);
    }

    // Position
    const pos = island.position as Record<string, unknown> | undefined;
    if (!pos || typeof pos.cx !== 'number' || typeof pos.cy !== 'number' ||
        typeof pos.rx !== 'number' || typeof pos.ry !== 'number') {
      errors.push(`${prefix}.position must have numeric cx, cy, rx, ry`);
    } else if (pos.rx <= 0 || pos.ry <= 0) {
      errors.push(`${prefix}.position.rx and ry must be > 0`);
    }

    // Landmark
    const lm = island.landmark as Record<string, unknown> | undefined;
    if (!lm || typeof lm.type !== 'string' || typeof lm.spritePath !== 'string') {
      errors.push(`${prefix}.landmark must have type and spritePath strings`);
    } else if (!lm.spritePath.startsWith('/images/')) {
      errors.push(`${prefix}.landmark.spritePath must start with /images/`);
    }

    // Vegetation
    const veg = island.vegetation as Record<string, unknown> | undefined;
    if (!veg) {
      errors.push(`${prefix}.vegetation is required`);
    } else {
      for (const key of ['trees', 'bushes', 'flowers', 'tufts']) {
        const val = veg[key];
        if (typeof val !== 'number' || val < 0 || val > 40) {
          errors.push(`${prefix}.vegetation.${key} must be 0-40`);
        }
      }
    }

    // Coastal
    const coast = island.coastal as Record<string, unknown> | undefined;
    if (!coast) {
      errors.push(`${prefix}.coastal is required`);
    } else {
      for (const key of ['shells', 'conchs', 'tidepools', 'rocks']) {
        const val = coast[key];
        if (typeof val !== 'number' || val < 0 || val > 20) {
          errors.push(`${prefix}.coastal.${key} must be 0-20`);
        }
      }
    }

    // Cliff
    const cliff = island.cliff as Record<string, unknown> | undefined;
    if (!cliff) {
      errors.push(`${prefix}.cliff is required`);
    } else {
      for (const key of ['vines', 'mossPatches']) {
        const val = cliff[key];
        if (typeof val !== 'number' || val < 0 || val > 10) {
          errors.push(`${prefix}.cliff.${key} must be 0-10`);
        }
      }
    }

    // smokeSources
    if (!Array.isArray(island.smokeSources)) {
      errors.push(`${prefix}.smokeSources must be an array`);
    }

    // spriteOverrides
    if (typeof island.spriteOverrides !== 'object' || island.spriteOverrides === null) {
      errors.push(`${prefix}.spriteOverrides must be an object`);
    }

    // walkCycleSheet
    if (island.walkCycleSheet !== null && typeof island.walkCycleSheet !== 'string') {
      errors.push(`${prefix}.walkCycleSheet must be string or null`);
    }

    // companion
    if (island.companion !== null && typeof island.companion === 'object') {
      const comp = island.companion as Record<string, unknown>;
      if (typeof comp.cx !== 'number' || typeof comp.cy !== 'number' ||
          typeof comp.rx !== 'number' || typeof comp.ry !== 'number') {
        errors.push(`${prefix}.companion must have numeric cx, cy, rx, ry`);
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, config: obj as unknown as IslandConfigFile };
}
