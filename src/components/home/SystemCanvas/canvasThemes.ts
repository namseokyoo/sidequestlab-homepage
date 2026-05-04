export type CanvasThemeId = 'graphite' | 'paper' | 'frost' | 'blueprint' | 'mono';

export type CanvasTheme = {
  id: CanvasThemeId;
  name: string;
  description: string;
};

export const canvasThemes: CanvasTheme[] = [
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Warm charcoal canvas with muted operational red accents.',
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Editorial paper canvas that blends with the ivory landing page.',
  },
  {
    id: 'frost',
    name: 'Frost',
    description: 'Soft product-site gray canvas with calm technical contrast.',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Muted systems drawing skin without neon dashboard effects.',
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Minimal wire canvas for a restrained editorial look.',
  },
];

export const defaultCanvasTheme: CanvasThemeId = 'graphite';

export function isCanvasThemeId(value: string | null): value is CanvasThemeId {
  return canvasThemes.some((theme) => theme.id === value);
}
