# Codex Plan Review — System Map Proof Trail Redesign

- `task_id`: `20260506-system-map-proof-trail-redesign`
- `reviewer_session_id`: `codex-019dfbf3-0281-79a3-8b6d-4e7824ed6acc`
- `mode`: `critic`
- `verdict`: `REVISE_BEFORE_BUILD`

## Key findings

1. The plan must define where `activeStageId` state lives. Current `SystemCanvas` and `ProofCaseStrip` are siblings, so proof-strip updates can be missed unless state is lifted to `PortfolioLanding` or a new wrapper.
2. Proof cards must use verified artifacts only. Avoid exposing PR numbers unless linked/verified; prefer repo-local reports/blog/project pages where safer.
3. KO/EN copy must be explicitly specified or checked because existing KO data includes English filler.
4. Remove unsupported/fake metric remnants including the `76%` progress bar in `CanvasNode`.
5. Decide whether dead/unused files such as `CanvasDetailPanel`, `CanvasThemeSwitcher`, and `canvasThemes` remain or are removed.
6. Add interaction assertion: clicking each stage must change detail title and related proof active card.
7. Separate local completion from release completion in implementation plan.

## Core response

Accepted. The plan will be revised before implementation to include lifted state, verified artifact policy, KO/EN copy requirements, removal of fake metric remnants, dead-code cleanup decision, and explicit interaction assertions.
