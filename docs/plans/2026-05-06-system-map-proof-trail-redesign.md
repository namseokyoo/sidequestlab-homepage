# System Map Proof Trail Redesign Implementation Plan

> **For Hermes:** Use Codex/Ralph-style goal execution after plan review. Core must verify with browser/visual evidence and adaptive harness before merge.

**Goal:** Redesign the landing-page system map so desktop and mobile are interactive, believable, and semantically clear as an operating proof trail rather than a decorative fake dashboard.

**Architecture:** Replace the current generic `Living Systems Map` dashboard metaphor with an `Operating Proof Trail`: a real, selectable path from brief → harness → build → QA → deploy → monitor → public proof. Desktop remains a spatial map with node selection and a meaningful detail panel. Mobile becomes an interactive timeline/stepper, not a collapsed fake drag map. The adjacent strip becomes related proof artifacts tied to the selected trail stage.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind classes, Playwright/browser visual QA.

---

## Intent Lock

- Preserve the editorial dark/ivory/red visual identity.
- Remove fake precision and fake-dashboard cues (`#1247`, `v2.3.1`, `Live · 3m ago`, unrelated 2025 timestamps, generic SaaS example cards).
- Make the claim legible: SidequestLab moves work from request/brief to public evidence through harnessed QA.
- Desktop and mobile must both be interactive.
- Interaction must have visible effect: selecting a stage updates highlighted path, detail panel, and related proof cards.
- Mobile must not promise drag/pan/zoom. It should use tap/stepper interaction.
- Do not invent traction, revenue, or unsupported metrics.

## Negative Criteria

The redesign fails if any of these remain true:

1. The section says or implies drag interaction without a useful drag model.
2. The map uses generic B2B AI placeholder projects unrelated to SidequestLab proof.
3. Red selected state is indistinguishable from error/failure state.
4. The case/proof strip is visually adjacent but not logically connected to the selected stage.
5. Mobile is merely a stacked copy of the desktop map with no mobile-specific interaction model.
6. The section cannot answer: “what proof path am I looking at?” within 5 seconds.
7. KO/EN meaning diverges.

## Proposed UX Model

### Section framing

Rename:

- From: `LIVING SYSTEMS MAP`
- To: `OPERATING PROOF TRAIL`

Subtitle:

- Desktop: `Select a stage to trace the evidence path`
- Mobile: `Tap through the proof trail`

Primary narrative:

`Brief → Harness → Build → QA Gate → Deploy → Monitor → Public Proof`

### Desktop interaction

- Show one horizontal/diagonal path, not arbitrary graph spaghetti.
- Default selected stage: `QA Gate` or `Public Proof`.
- Clicking a node:
  - sets selected stage
  - highlights only prior/current path up to the stage
  - updates detail panel with stage title, status, proof, artifact, and CTA
  - updates related proof cards below
- Decorative controls should be removed unless they add value. No minimap/toolbar.
- Use red for selected path/accent only. Status chip uses separate neutral/success style.

### Mobile interaction

- Render as a vertical timeline or stepper.
- Each stage is a button/card with step number and status chip.
- Tapping a stage expands/updates a detail card immediately below or above the list.
- No drag/pan/zoom/minimap language.
- Keep dark section compact enough to avoid feeling like an endless dashboard stack.

### Related proof strip

Replace generic case cards with real portfolio/proof artifacts:

1. Homepage Visual Polish — `Visual QA · PR #3`
2. Portfolio Content Proof — `Content Loop · PR #4`
3. Harness Engineering — `Quality Gate · Policy`
4. Display Lab / Public Project — `Live Service · Project`

Each card should explain why it is related to the selected stage or at least use stage tags.

## Plan Review Revisions

Codex critic review completed before implementation: `docs/reports/2026-05-06-system-map-proof-trail-plan-review.md`.

Accepted revisions:

- Lift `activeStageId` state to `PortfolioLanding` or a new wrapper so `SystemCanvas` and `ProofCaseStrip` are driven by the same selected stage.
- Proof cards must include `stageIds` or `primaryStageId`; selecting a stage must visibly emphasize related proof cards.
- Use only verified/local artifacts in visible copy unless an external URL has been checked. Prefer report/blog/workflow/harness/project pages over unsupported PR-number claims.
- Add explicit KO/EN copy for every stage; KO must not be English filler.
- Remove fake metric remnants including the old `76%` progress bar.
- Decide dead-code cleanup: remove or stop exporting unused `CanvasDetailPanel`, `CanvasThemeSwitcher`, and `canvasThemes` if the redesign no longer uses them.
- Verification must assert each stage click changes both detail title and related proof emphasis.
- Local completion means lint/build/browser/visual/harness pass. Release completion means PR checks pass and merge to main.

## Data Model Tasks

### Task 0: Lift selected-stage state and connect map to proof strip

**Files:**
- Modify: `src/components/home/PortfolioLanding.tsx`
- Modify: `src/components/home/SystemCanvas/SystemCanvas.tsx`
- Modify: `src/components/home/ProofCaseStrip.tsx`

`PortfolioLanding` should own:

```ts
const [activeStageId, setActiveStageId] = useState<ProofStageId>('qa');
```

It passes `activeStageId` and `onStageSelect` to `SystemCanvas`, and `activeStageId` to `ProofCaseStrip`. This is mandatory: without shared state the proof strip remains decorative.

### Task 1: Replace `canvasData.ts` with proof-trail data

**Files:**
- Modify: `src/components/home/SystemCanvas/canvasData.ts`

Create types for:

```ts
export type ProofStageId = 'brief' | 'harness' | 'build' | 'qa' | 'deploy' | 'monitor' | 'proof';
export type ProofStageStatus = 'source' | 'locked' | 'in-review' | 'passed' | 'released' | 'observed' | 'published';
```

Each stage needs:

- id
- order
- type/status
- x/y for desktop path
- copy.ko/en:
  - eyebrow
  - title
  - shortTitle/mobileTitle
  - description
  - statusLabel
  - proof
  - artifact
  - ctaLabel
  - href

Use concrete but truthful copy. Prefer real artifacts and no fake metrics. KO copy must be Korean; EN copy must preserve the same meaning without being a literal machine translation.

### Task 2: Rebuild edge rendering as sequential path

**Files:**
- Modify: `src/components/home/SystemCanvas/CanvasEdgeLayer.tsx`

Change edges from arbitrary graph edges to sequential path segments. Highlight segments whose target order is <= selected order. Dim future segments.

### Task 3: Rework `CanvasNode` semantics

**Files:**
- Modify: `src/components/home/SystemCanvas/CanvasNode.tsx`

Node should show:

- step number
- title
- short description
- status chip
- selected state separated from status color

No red side handles on mobile. No fake connection handles unless they mean path endpoints.

### Task 4: Rebuild `SystemCanvas` layout and interaction

**Files:**
- Modify: `src/components/home/SystemCanvas/SystemCanvas.tsx`

Desktop:

- Header: `OPERATING PROOF TRAIL` + clear subtitle
- Spatial map with selectable stages
- One detail panel driven by `activeStage`
- Remove decorative decision log/minimap/toolbar/about panels

Mobile:

- Timeline/stepper layout
- Selected detail card
- Clear tap instruction

### Task 5: Replace `ProofCaseStrip` with related proof cards

**Files:**
- Modify: `src/components/home/ProofCaseStrip.tsx`

Rename visible copy from generic `CASE STUDIES` to `RELATED PROOF` or `PROOF ARTIFACTS`.

Cards should use real links and explain artifact types:

- `/workflow`
- `/harness`
- `/blog/portfolio-content-proof-loop`
- `/projects`

Each proof card must include `stageIds: ProofStageId[]`. When `activeStageId` matches, the card receives a clear active border/chip and may be sorted first or emphasized. Cards must not expose unverified PR numbers unless linked and checked.

### Task 6: Visual polish and responsive CSS

**Files:**
- Modify: `src/app/globals.css` as needed

Ensure:

- no horizontal overflow desktop/mobile
- dark text contrast acceptable
- selected state clear
- mobile section not too tall
- no fake minitool UI remains

## Verification Plan

1. `npm run lint`
2. `npm run build`
3. Browser console checks `/ko`, `/en`
4. Playwright screenshots:
   - KO desktop
   - KO mobile
   - EN desktop
   - EN mobile
5. Confirm interaction:
   - click/tap each stage
   - selected detail title changes
   - path/timeline selected state changes
   - related proof cards remain legible
   - related proof active/emphasis changes with selected stage
   - KO/EN blog/project/workflow/harness links resolve without 404
6. Vision QA:
   - desktop system map no longer reads as fake dashboard
   - mobile reads as timeline/proof trail, not failed map collapse
7. Adaptive harness final report with artifact refs and PASS/CONDITIONAL/FAIL.

## Completion Criteria

- Branch PR created and CI/Vercel checks pass.
- Squash merged to `main` after checks pass.
- Final report includes task_id, harness_ref, harness_verdict, artifact_refs.
