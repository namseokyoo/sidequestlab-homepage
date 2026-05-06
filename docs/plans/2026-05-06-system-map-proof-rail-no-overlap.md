# System Map Proof Rail No-Overlap Implementation Plan

> **For Hermes:** Implement this as a production revision to the accepted mockup. Use Core verification with visual evidence before PR/merge.

**Goal:** Replace the right-side overlapping system-map card field with a clear no-overlap `Proof Rail + Selected Detail + Related Proof` layout that works on desktop, tablet landscape, and mobile.

**Architecture:** Keep the existing `activeStageId` state in `PortfolioLanding`. Rework `SystemCanvas` so stage buttons are an ordered rail/stepper rather than absolute-position cards. Keep mobile as tap-based timeline but share the same rail/detail mental model. Keep `ProofCaseStrip` synchronized with the selected stage.

**Tech Stack:** Next.js React components, Tailwind utility classes, Playwright verification, SidequestLab adaptive harness.

---

## Source of truth

User approved the generated mockup direction: `/tmp/system-map-proof-rail-expected.png`.

The UI must visibly satisfy:

1. No overlapping stage cards on the right hero canvas.
2. Overall proof path is visible as a rail/stepper.
3. Selected stage is promoted into one large detail card.
4. Related proof cards are connected by active emphasis, not by vague decoration.
5. Tablet landscape/split viewport must not keep the old dense card map.
6. Web and mobile remain interactive: clicking/tapping stages changes detail and proof emphasis.

## Anti-patterns to remove

- Absolute-position large stage cards that overlap at narrow widths.
- Selected stage buried inside a card pile.
- Detail panel floating over stage cards.
- Weak/hidden connector lines behind cards.
- Fake dashboard complexity as the main visual appeal.

## Task 1: Rework SystemCanvas layout

**Files:**
- Modify: `src/components/home/SystemCanvas/SystemCanvas.tsx`
- Modify: `src/components/home/SystemCanvas/CanvasNode.tsx`
- Modify: `src/components/home/SystemCanvas/CanvasEdgeLayer.tsx` or remove if unused.

**Implementation:**

- Remove/disable absolute stage positioning for the primary layout.
- Use a rail container:
  - desktop/tablet: horizontal grid rail, ideally `grid-cols-7` on wide enough surfaces.
  - medium/narrow: horizontal scroll or wrapped rail with no overlap.
  - mobile: vertical timeline or two-column compact rail if needed.
- Ensure selected detail card sits below rail and never overlays stage buttons.
- Use selected state with z-index only for emphasis, not for overlapping.

## Task 2: Selected detail card

**Files:**
- Modify: `src/components/home/SystemCanvas/SystemCanvas.tsx`

**Implementation:**

- Show one large card for `activeStage`.
- Include:
  - selected stage number
  - title
  - description
  - `proof` block
  - `artifact` block
  - CTA
- Add helper copy making the interaction obvious:
  - KO: `단계를 선택하면 아래 상세와 연결된 증거가 바뀝니다.`
  - EN: `Select a stage to update the detail and linked proof.`

## Task 3: Make related proof connection explicit

**Files:**
- Modify: `src/components/home/ProofCaseStrip.tsx`

**Implementation:**

- Keep the active proof card emphasis already connected through `activeStageId`.
- Improve active label to say `Stage NN linked proof` / `단계 NN 연결 증거`.
- Ensure strip visually reads as below-detail proof evidence, not separate case studies.

## Task 4: Responsive acceptance

**Files:**
- Modify: same files above.

**Acceptance:**

- At width similar to user screenshot (`2388x1668` overall, right hero about 58%), no stage card overlap.
- Active detail card fully visible, not clipped right/left.
- No horizontal page overflow.
- On mobile, stage list/timeline remains tap-friendly.

## Task 5: Verification

Run:

```bash
npm run lint
npm run build
```

Use Playwright to capture:

- KO desktop/tablet-like screenshot
- KO mobile screenshot
- EN desktop/tablet-like screenshot
- EN mobile screenshot

Interaction checks:

- 7 stage controls visible.
- Clicking/tapping all 7 changes selected detail title.
- Selected detail card has no overlap with stage controls.
- `document.documentElement.scrollWidth <= window.innerWidth` for each viewport.
- Related proof active labels change with selected stage.

Vision QA must explicitly check the user complaint:

- cards do not overlap
- selected detail is promoted and visible
- connection from rail → detail → related proof is clear
- tablet landscape/split viewport no longer looks like piled cards

## Final report requirements

Final report must include:

- `task_id`: `20260506-system-map-proof-rail-no-overlap`
- `harness_ref`
- `harness_verdict`
- `builder_session_id`
- `verifier_session_id`
- artifact refs to screenshots, interaction JSON, plan, harness, final report, and modified source files.
