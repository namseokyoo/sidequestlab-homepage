# System Map Proof Rail No-Overlap Final Report

- `task_id`: `20260506-system-map-proof-rail-no-overlap`
- `harness_ref`: `projects/sidequestlab-homepage/docs/reports/2026-05-06-system-map-proof-rail-no-overlap-harness.md`
- `harness_verdict`: `PASS`
- `builder_session_id`: `core-implementation-20260506-proof-rail-no-overlap`
- `verifier_session_id`: `core-browser-visual-qa-20260506-proof-rail-no-overlap`
- `source_of_truth_update`: `accepted_mockup:/tmp/system-map-proof-rail-expected.png + user screenshot complaint that the previous right-side system map overlapped, did not promote the selected card, and did not communicate connectivity`
- `reference_drift_classification`: `intentional: previous spatial/overlapping map removed in favor of accepted no-overlap proof rail + selected detail + related proof structure`
- `artifact_refs`: `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/interaction-qa-results.json`, `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/ko-tablet-landscape.png`, `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/en-mobile-prod.png`, `projects/sidequestlab-homepage/src/components/home/SystemCanvas/SystemCanvas.tsx`, `projects/sidequestlab-homepage/src/components/home/SystemCanvas/CanvasNode.tsx`, `projects/sidequestlab-homepage/src/components/home/ProofCaseStrip.tsx`

## Summary

The landing hero right-side system map was revised from a spatial card map into the accepted no-overlap proof rail design:

- Seven proof stages are now a stable rail/list, not absolute overlapping cards.
- The selected stage is promoted into one dominant detail card below the rail.
- A secondary explanation card describes how rail, detail, and related proof cards connect.
- Related proof cards reorder and highlight based on the selected stage.
- The problematic fake/spatial-map language remains removed.
- Tablet landscape, desktop, and mobile evidence was captured for KO/EN.

## Implementation Changes

- `src/components/home/SystemCanvas/SystemCanvas.tsx`
  - Replaced overlapping absolute map with contained proof rail.
  - Added selected detail card as primary content surface.
  - Added secondary connection explainer with lower visual priority.
  - Strengthened connector line while keeping cards non-overlapping.
- `src/components/home/SystemCanvas/CanvasNode.tsx`
  - Converted stage nodes into responsive rail/list buttons.
  - Preserved explicit selected state and keyboard/focus affordance.
- `src/components/home/ProofCaseStrip.tsx`
  - Related proof cards now use stage-aware active labels such as `Stage 07 linked proof` / `단계 07 연결 증거`.
  - Cards directly tied to the selected stage are emphasized and sorted first.
- `docs/plans/2026-05-06-system-map-proof-rail-no-overlap.md`
  - Records the accepted mockup-driven implementation plan.
- `docs/reports/2026-05-06-system-map-proof-rail-no-overlap-harness.md`
  - Records verification criteria.

## Evidence

### Build and Static Checks

- `npm run lint`: PASS
- `npm run build`: PASS

Build warnings observed but non-blocking and pre-existing:

- Next.js inferred workspace root due to multiple lockfiles.
- Edge runtime disables static generation for the affected page.

### Browser Console

Production-mode browser checks on `http://127.0.0.1:3135`:

- `/ko`: `total_messages: 0`, `total_errors: 0`
- `/en`: `total_messages: 0`, `total_errors: 0`

### Interaction QA

Artifact:

- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/interaction-qa-results.json`

Results across KO/EN and tablet-landscape/desktop/mobile:

- `stageButtonCount`: 7
- `distinctDetailTitles`: 7
- `overlapPairs`: `[]`
- `detailOverlapStage`: `false`
- `overflowX`: `false`
- `fakeStrings`: `[]`

Validated removed fake/old strings:

- `DRAG`
- `LIVING SYSTEMS MAP`
- `#1247`
- `v2.3.1`
- `Live · 3m`
- `76%`
- `CASE STUDIES`

### Screenshots

Artifacts:

- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/ko-tablet-landscape.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/ko-desktop.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/ko-mobile.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/en-tablet-landscape.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/en-desktop.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/en-mobile.png`
- `projects/sidequestlab-homepage/docs/reports/system-map-proof-rail-no-overlap-evidence/en-mobile-prod.png`

### Visual QA

- KO tablet landscape visual QA: PASS
  - Fixes the user screenshot complaint.
  - No overlapping rail cards.
  - Selected stage promoted into a clear large detail card.
  - Related proof relationship understandable.
  - No horizontal clipping/overflow.
- EN mobile production visual QA: PASS
  - No dev overlay.
  - No proof rail overlap/clipping.
  - Selected stage and selected detail are clear.
  - Related proof connection is understandable via matching selected stage number/context.

## Acceptance Criteria

- [x] The accepted proof rail direction is implemented.
- [x] No overlapping stage cards on tablet landscape, desktop, or mobile.
- [x] Selected stage is promoted into one clear large detail card.
- [x] Related proof cards show direct stage-linked emphasis.
- [x] KO/EN covered.
- [x] Browser console clean in production mode.
- [x] Lint/build PASS.
- [x] Adaptive harness final gate PASS.

## Verdict

`PASS` — The user's screenshot complaint is addressed by replacing the overlapping spatial card map with a stable proof rail, selected detail card, and related proof connection model.