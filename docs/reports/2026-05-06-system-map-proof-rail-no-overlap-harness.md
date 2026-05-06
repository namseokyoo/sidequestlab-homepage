# System Map Proof Rail No-Overlap Harness

- `task_id`: `20260506-system-map-proof-rail-no-overlap`
- `status`: `active`
- `task_type`: `visual-interactive-frontend`
- `risk_tier`: `external-facing`
- `intent_lock`: `replace the overlapping system-map card field with an explicit no-overlap proof rail, selected detail card, and linked proof evidence across desktop, tablet, and mobile`
- `source_of_truth_update`: `user screenshot showed cards overlapping, selected stage not promoted, and connection unclear; accepted mockup /tmp/system-map-proof-rail-expected.png as target direction`
- `required_evidence`: `plan; lint; build; browser-console; playwright-interaction-json; desktop-tablet-mobile screenshots; vision-qa; adaptive-final-gate; PR-checks`
- `negative_criteria`: `overlapping stage cards; selected stage clipped or buried; detail panel overlaying stages; hidden connection; horizontal overflow; only desktop checked; fake dashboard complexity`
- `builder_session_id`: `core-codex-proof-rail-implementation-20260506`
- `verifier_session_id`: `core-browser-visual-qa-proof-rail-20260506`

## Acceptance gates

PASS requires:

1. 7 stage controls are visible and clickable/tappable.
2. Selecting each stage changes the large detail card.
3. Stage controls do not overlap each other at tested widths.
4. Detail card does not overlap stage controls.
5. Selected stage/detail/proof relationship is clear.
6. Related proof cards emphasize active stage with explicit label.
7. KO/EN desktop/tablet/mobile screenshots show no clipping or horizontal overflow.
8. `npm run lint` and `npm run build` pass.
9. Adaptive final gate passes with real artifact refs.

## Viewports to test

- desktop/tablet-like: `2388x1668` to match user screenshot class.
- desktop common: `1440x1100`.
- mobile: `390x1100`.

## Reference drift classification

- Replacing spatial card map with proof rail is intentional.
- Removing card overlap is required.
- Reducing decorative map complexity is acceptable and desired.
- Any card overlap or selected-stage clipping is a defect.
