# System Map Proof Trail Redesign Adaptive Harness

- `task_id`: `20260506-system-map-proof-trail-redesign`
- `status`: `active`
- `risk_tier`: `external-facing-visual-interactive`
- `intent_lock`: `redesign the landing-page system map into a clear interactive operating proof trail across desktop and mobile`
- `required_evidence`: `plan-review; lint; build; browser-console; interaction-check; desktop-mobile-screenshots; vision-qa; final-report-gate; PR-checks`
- `negative_criteria`: `fake drag promise; generic fake B2B dashboard copy; ambiguous red failure/selected state; unrelated proof strip; mobile stacked fake map; unsupported metrics; KO/EN meaning drift`
- `builder_session_id`: `codex-019dfbf5-9cdd-7161-852c-98151637b939`
- `verifier_session_id`: `core-browser-visual-qa-20260506-system-map-proof-trail`

## Source of Truth

User critique and Core review established that the current system map is plausible but amateur because it looks like a decorative dashboard rather than a meaningful proof interface. The redesign must make the claimed meaning explicit: SidequestLab work moves from brief to harnessed QA, deployment, monitoring, and public evidence.

## Role Split

- Planner: Core writes the implementation plan.
- Plan critic: Codex/Ralph-style review attacks the plan before implementation.
- Builder: Codex/Ralph-style implementation or Core direct if Codex is blocked.
- Verifier: Core browser/visual QA and adaptive harness final gate.

## Acceptance Criteria

1. Section label and subtitle clearly explain the operating proof trail.
2. Desktop is interactive: selecting a stage changes selected node/path/detail content.
3. Mobile is interactive: tapping a stage changes selected detail and reads as a timeline/stepper.
4. No fake drag, minimap, toolbar, fake dates, fake IDs, fake versions, or generic dashboard filler remains.
5. Related proof strip uses real SidequestLab proof artifacts and has a clear relationship to the trail.
6. KO/EN both render and preserve equivalent meaning.
7. No horizontal overflow on desktop/mobile.
8. Browser console has no app JS errors.
9. Lint/build pass.

## Evidence Requirements

Final report must reference:

- Plan file
- Harness file
- Modified source files
- Playwright screenshot evidence for KO/EN desktop/mobile
- Interaction-check JSON/log
- Vision QA notes
- PR URL and final main commit
