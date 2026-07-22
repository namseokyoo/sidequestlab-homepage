import {
  PROJECT_VISIBILITIES,
  type CanonicalProject,
  type CanonicalProjectCatalog,
} from './model.ts';
import {
  hasExactKeys,
  isRecord,
  readLocalizedText,
  readOneOf,
  readPublicId,
} from './parse-utils.ts';

function readCanonicalProject(value: unknown): CanonicalProject | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['id', 'visibility', 'name', 'summary'])
  ) {
    return null;
  }
  const id = readPublicId(value.id);
  const visibility = readOneOf(value.visibility, PROJECT_VISIBILITIES);
  const name = readLocalizedText(value.name, 64);
  const summary = readLocalizedText(value.summary, 180);
  return id === null || visibility === null || name === null || summary === null
    ? null
    : { id, visibility, name, summary };
}

export function parseCanonicalProjectCatalog(
  input: unknown,
): CanonicalProjectCatalog | null {
  if (
    !isRecord(input) ||
    !hasExactKeys(input, ['schemaVersion', 'projects']) ||
    input.schemaVersion !== '1.0' ||
    !Array.isArray(input.projects)
  ) {
    return null;
  }

  const projects: CanonicalProject[] = [];
  const ids = new Set<string>();
  for (const value of input.projects) {
    const project = readCanonicalProject(value);
    if (project === null || ids.has(project.id)) return null;
    ids.add(project.id);
    projects.push(project);
  }
  return { schemaVersion: '1.0', projects };
}
