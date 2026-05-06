import { canvasThemes, type CanvasThemeId } from './canvasThemes';

type CanvasThemeSwitcherProps = {
  value: CanvasThemeId;
  onChange: (theme: CanvasThemeId) => void;
};

export default function CanvasThemeSwitcher({ value, onChange }: CanvasThemeSwitcherProps) {
  return (
    <div aria-label="Canvas theme" className="canvas-theme-switcher flex flex-wrap items-center gap-1 rounded-full border p-1">
      {canvasThemes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          aria-pressed={value === theme.id}
          title={theme.description}
          onClick={() => onChange(theme.id)}
          className={`canvas-theme-button rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 ${
            value === theme.id ? 'canvas-theme-button-active' : ''
          }`}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
