# SidequestLab Homepage Design System

## 1. Atmosphere & Identity

SidequestLab reads as an editorial operations dossier: ivory paper, graphite canvas, compact proof cards, and restrained red marks that signal verified evidence instead of decoration. The signature is the split between a printed proof brief on the left and an interactive evidence map on the right.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | `--sql-ivory` | `#f3eee5` | `#f3eee5` | Editorial page background |
| Surface/secondary | `--sql-paper` | `#ebe4d8` | `#ebe4d8` | Page backing and warm panels |
| Surface/dark | `--sql-charcoal` | `#151412` | `#151412` | Canvas region background |
| Surface/dark-soft | `--sql-charcoal-soft` | `#1d1b18` | `#1d1b18` | Dark elevated panels |
| Text/primary | `--sql-ink` | `#11100e` | `#11100e` | Headlines and editorial body |
| Accent/proof | `--sql-red` | `#c92019` | `#c92019` | Proof markers, selected states, CTAs |
| Accent/proof-muted | `--sql-red-muted` | `#8f221e` | `#8f221e` | Hover and lower-emphasis red |
| Canvas/text | `--canvas-text` | theme-scoped | theme-scoped | Canvas labels and cards |
| Canvas/accent | `--canvas-accent` | theme-scoped | theme-scoped | Canvas selected stage |
| Canvas/border | `--canvas-border` | theme-scoped | theme-scoped | Canvas outlines |
| Canvas/grid | `--canvas-grid` | theme-scoped | theme-scoped | Map grid and technical texture |

### Rules

- Red means proof, selection, or a primary action. Do not use it as general decoration.
- Warm ivory surfaces carry public-facing explanatory copy; graphite surfaces carry system maps and proof artifacts.
- Any new homepage color must be added here before use.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(3.25rem, 7.4vw, 6.75rem)` | 900 | 1.04 | -0.095em | Homepage hero |
| H1 | 2.25rem-3rem | 900 | 1.1-1.2 | -0.055em | Major section headers |
| H2 | 1.5rem-2rem | 800-900 | 1.2-1.3 | -0.04em | Section and proof headings |
| H3 | 1rem-1.25rem | 700-900 | 1.3-1.4 | -0.025em | Card headings |
| Body | 1rem | 400-500 | 1.75-1.85 | 0 | Editorial paragraphs |
| Body/sm | 0.875rem | 400-600 | 1.6-1.75 | 0 | Card descriptions |
| Caption | 0.625rem-0.75rem | 600-700 | 1.3-1.5 | 0.1em-0.22em | Labels, badges, proof metadata |

### Font Stack

- Primary: `var(--font-geist-sans), Arial, Helvetica, sans-serif`
- Mono: `var(--font-geist-mono), monospace`

### Rules

- Display text may use tight tracking; compact panels use smaller headings and avoid hero-scale type.
- Korean text uses `break-keep` and `word-break: keep-all` where phrases must not split awkwardly.
- Labels use the mono stack and uppercase tracking.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon and label gaps |
| `--space-2` | 8px | Compact inline groups |
| `--space-3` | 12px | Badge and small card internals |
| `--space-4` | 16px | Standard card gap |
| `--space-5` | 20px | Dense section padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Panel padding |
| `--space-10` | 40px | Section internal rhythm |
| `--space-16` | 64px | Page section rhythm |
| `--space-20` | 80px | Hero breathing room |

### Grid

- Max content width: 1600px for the split homepage stage, 1152px for supporting proof sections.
- Homepage first viewport: `31.5rem` editorial rail plus flexible canvas.
- Supporting proof sections use responsive grids: one column on mobile, two to four columns on larger screens.

### Rules

- Fixed-format proof cards and tool lists must use stable grid tracks so state changes do not resize the layout.
- Use full-width bands, not nested page-section cards.
- Cards are for repeated proof items only.

## 5. Components

### Editorial Hero Panel

- **Structure**: eyebrow, multiline display heading, body, three proof-pillar links, latest-proof log.
- **Variants**: locale-specific copy only.
- **Spacing**: `--space-8`, `--space-10`, `--space-16`.
- **States**: pillar links require hover, focus-visible, and active text/accent changes.
- **Accessibility**: nav has a locale-specific `aria-label`; focus rings use `--sql-red`.
- **Motion**: hover color and arrow translation only.

### System Canvas

- **Structure**: proof-stage rail, selectable nodes, detail card, linked proof cards.
- **Variants**: graphite, paper, frost, blueprint, mono.
- **Spacing**: compact 4px-based map and card spacing.
- **States**: default, hover, selected, focus-visible.
- **Accessibility**: stage controls use semantic buttons and visible labels.
- **Motion**: transform and color transitions only.

### Proof Card

- **Structure**: visual strip, label, title, description, optional active badge.
- **Variants**: verified proof, linked proof, under-review queue item.
- **Spacing**: `--space-4` and `--space-5`.
- **States**: hover lift, selected border, focus-visible ring.
- **Accessibility**: linked cards must have descriptive text, not just visual status.
- **Motion**: hover lift may use `translateY`; no layout animation.

### Proof Dossier Section

- **Structure**: evidence summary panel, tool-scope grid, local verification list, review-queue list.
- **Variants**: Display Lab verified package, queue item.
- **Spacing**: `--space-5`, `--space-6`, `--space-8`.
- **States**: links and buttons use proof red hover/focus states.
- **Accessibility**: lists are semantic; external and local evidence links are text-visible.
- **Motion**: no ambient motion; evidence content should remain stable for scanning.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease | Link and button color |
| Standard | 200ms | ease | Card lift and border change |
| Emphasis | 300ms | ease-in-out | Canvas theme transition |

### Rules

- Animate only `transform`, `opacity`, `color`, `background-color`, `border-color`, and `box-shadow`.
- Respect `prefers-reduced-motion` globally.
- Motion must indicate interaction or selection; no decorative idle loops.

## 7. Depth & Surface

### Strategy

Mixed: editorial surfaces use borders and tonal paper shifts; canvas/proof cards use subtle shadows and translucent overlays.

| Level | Value | Usage |
|-------|-------|-------|
| Border/default | `1px solid rgba(17, 16, 14, 0.14)` | Light editorial cards |
| Border/canvas | `1px solid var(--canvas-border)` | Canvas cards and nodes |
| Shadow/subtle | `0 1px 2px rgba(0, 0, 0, 0.05)` | Light proof panels |
| Shadow/canvas | Tailwind `shadow-lg shadow-black/20` | Dark proof cards |
| Shadow/selected | `0 0 0 1px rgba(209, 44, 36, 0.22)` | Active proof state |

### Rules

- Do not place cards inside cards.
- Use texture and grid overlays only as low-contrast context.
- Evidence text must stay readable over all surfaces.
