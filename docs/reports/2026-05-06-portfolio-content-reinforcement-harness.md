# Portfolio Content Reinforcement Adaptive Harness

- `task_id`: `20260506-portfolio-content-reinforcement`
- `status`: `active`
- `risk_tier`: `external-facing-content`
- `builder_session_id`: `core-direct-builder-20260506-content`
- `verifier_session_id`: `pending`

## Intent Lock

- `intent_lock`: `reinforce homepage portfolio content with truthful proof narrative across KO/EN`
- `required_evidence`: `lint/build/browser-console/playwright-screenshots/vision-qa/final-report-gate`
- `negative_criteria`: `no unsupported traction or revenue claims; no KO/EN meaning drift; no unreadable mobile content; no evidence-free PASS`

Strengthen the SidequestLab homepage content after visual polish so a first-time visitor can answer:

1. What does SidequestLab actually build?
2. What evidence proves the lab can operate AI-built products?
3. Which projects/services are credible entry points?
4. How does the adaptive harness prevent unverified public claims?

## Source-of-truth updates

- The previous visual polish completed layout/readability; this task must now improve the portfolio narrative and content density.
- Content must remain truthful to existing artifacts: four operating services, public project links, blog posts, workflow/harness pages, and the adaptive harness evidence already present in this repository.
- Avoid invented customer counts, revenue, adoption metrics, or performance claims unless backed by an existing artifact.
- KO and EN must both be coherent and comparable; neither locale can be a stale translation.

## Required implementation evidence

- Homepage proof/content section added and wired into `/ko` and `/en`.
- KO/EN message copy refreshed for hero/project/blog framing.
- Featured project copy made more outcome-oriented without unsupported quantitative claims.
- Reports and plan committed with the source changes.

## Required verification evidence

- `npm run lint`: PASS
- `npm run build`: PASS
- Browser console check for `/ko` and `/en`: no blocking JS errors
- Screenshot evidence for KO/EN desktop and mobile after content changes
- Final report must include real `artifact_refs` and pass `scripts/adaptive_harness_gate.py validate-final`

## Negative criteria

- FAIL if content claims unverified traction, revenue, or user counts.
- FAIL if KO/EN diverge materially in meaning.
- FAIL if the new section causes horizontal overflow, clipped CTAs, or unreadable small text.
- FAIL if final PASS is based only on text assertion without screenshots/logs/artifact refs.
