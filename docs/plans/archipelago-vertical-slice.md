# Archipelago Vertical Slice Master Plan

- Task ID: `ai-fleet-living-archipelago-vertical-slice-20260721`
- Status: foundation complete; runtime implementation not started
- Direction approved by User: 2026-07-21
- Product repository: `projects/sidequestlab-homepage`
- Canonical design contract: `DESIGN.md`
- Approved visual receipt: `docs/references/archipelago/approved-visual-v1.png`
- Reference manifest: `docs/references/archipelago/reference-manifest.json`
- Adaptive harness: `.hermes/harness/ai-fleet-living-archipelago-vertical-slice-20260721/`

## 1. Intent lock

Build one homepage vertical slice that makes SidequestLab legible as a living, proof-first AI portfolio through a bright, premium 2.5D cozy-RPG archipelago. Three differentiated project islands, exactly two visible non-robot AI Wayfarers on the selected island, lifecycle actions, a navigator boat, and direct evidence/product paths should communicate both charm and operational truth.

The visitor explores; the visitor does not command the team. Projects are islands and destinations, never vessels. The boat represents visitor navigation only.

## 2. Foundation scope completed by this plan

This foundation slice covers master-plan Todos 1, 2, 4, 5, and 6:

| Todo | Foundation result | Artifact |
|---|---|---|
| 1. Lock repo boundary and baseline | Owning repository, Git state, and all pre-existing dirty paths recorded and classified | Harness implementation map |
| 2. Canonicalize the approved visual direction | Old editorial-workshop direction superseded by a bright orthographic archipelago system | `DESIGN.md` |
| 4. Define reusable desktop/mobile primitives | Scene, proof, navigation, responsive, and state contracts specified | `DESIGN.md` §§4–5 |
| 5. Define Wayfarer and lifecycle behavior | Exactly two visible 2.8–3.2-head-tall premium chibi humanoids (Code Engineer and QA Navigator), semantic stage actions, reduced motion | `DESIGN.md` §§7–8 |
| 6. Lock project differentiation and accessibility | Three-island matrix, proof paths, localization, keyboard, zoom, contrast gates | `DESIGN.md` §§6, 9–11 |

No runtime source, package, messages, tests, or image assets are changed by this foundation task.

## 3. Context and reference lock

The User approved the bright, cute-but-premium archipelago direction on 2026-07-21. The canonical 1536×1024 PNG is present at `docs/references/archipelago/approved-visual-v1.png` and is bound in the manifest by SHA-256 `108ca8b0200bc7cb983b8e50d2dcb50ffb5dc554b3fad9d6a78052f8023dfe88`. No implementation or reviewer may claim visual-reference parity until implementation screenshots are compared with that exact receipt.

The current dirty working tree contains an unfinished Living Workshop/editorial direction. Preserve it as user work while planning migration. Existing truth-bearing data flow, fail-closed link behavior, lifecycle semantics, reduced-motion checks, and tests are candidates to adapt; the old visual shell and workbench art direction are candidates to replace only in a separately authorized runtime slice.

## 4. Target information architecture

1. Proof hero: SidequestLab identity, plain-language promise, primary portfolio route.
2. Archipelago overview: three project islands plus an equivalent semantic list.
3. Selected project diorama: purpose, current lifecycle activity, freshness, and landmarks.
4. Direct link dock: details, verified live product, source when public, and evidence.
5. Proof rail: concrete outcomes, timestamps, source status, and unavailable explanations.

One canonical project model should feed the scene, semantic list, cards, and structured metadata. Rendering must never fork factual project state into hard-coded visual-only copies.

## 5. Implementation waves

### Wave A — reference ingestion and primitive showcase

- Preserve the approved visual at the manifest path without modifying it.
- Re-verify its byte size and SHA-256 before comparison.
- Create a dedicated primitive showcase for tokens, orthographic camera, materials, lighting, island silhouettes, Wayfarers, lifecycle poses, link states, responsive modes, and reduced motion.
- Obtain independent design review before homepage integration.

Exit gate: approved image hash is unchanged; showcase demonstrates the design contract at desktop and mobile sizes; reviewer records PASS or actionable findings.

### Wave B — canonical model and semantic shell

- Adapt the existing fail-closed project data boundary into one canonical, typed island/project view model.
- Preserve verified URLs and expose proof URLs rather than dropping them.
- Build the semantic project list, direct link dock, freshness marks, and unavailable states before map enhancement.
- Keep English and Korean content parity and avoid invented deployment links.

Exit gate: unit tests cover valid, stale, unsafe, missing, and localized states; all essential content and destinations work without the scene layer.

### Wave C — archipelago scene

- Compose the three project islands using the differentiation matrix.
- Add exactly two visible non-robot Wayfarers to the selected-island slice—Code Engineer and QA Navigator—using 2.8–3.2-head-tall premium chibi/stylized humanoid proportions and lifecycle actions driven by canonical state.
- Add the navigator boat as a selection transition only.
- Keep a fixed orthographic camera, stable light direction, bounded detail density, and semantic HTML equivalence.

Exit gate: island silhouette recognition, lifecycle correctness, keyboard parity, and reduced-motion behavior pass.

### Wave D — responsive integration and visual QA

- Integrate the scene into the localized homepage.
- Implement desktop map, tablet adaptation, and mobile vertical dioramas rather than a scaled map.
- Validate 200% zoom, touch targets, screen-reader output, Korean expansion, color contrast, Save-Data behavior, and image/JavaScript failure paths.
- Capture desktop and mobile screenshots and compare them with the approved reference.

Exit gate: production build and automated checks pass; independent verifier records visual and accessibility disposition; no legacy editorial/robot/vessel framing remains.

## 6. File ownership for future runtime work

The following is a migration plan, not authorization to edit in this foundation task:

- Adapt: localized messages, locale layout/page, global tokens, header framing, canonical project data, server/view-model boundary, and lifecycle/model tests.
- Replace after parity is proven: `PortfolioLanding`, `LivingWorkshop` presentation components, workbench character manifest, and old workbench images.
- Keep: package/tooling configuration unless a concrete implementation requirement proves otherwise.
- Preserve as historical: existing `.codex`, `.omo`, and prior `.hermes/harness` artifacts.

Runtime workers must re-check the dirty baseline before editing and must not overwrite unrelated user changes.

## 7. Testable acceptance criteria

- The viewport communicates “SidequestLab portfolio” before requiring map interaction.
- DisplayLab, BookSalon, and N-Bang are distinguishable by silhouette, landmark family, and evidence behavior.
- Exactly two non-robot Wayfarers are visible on the selected-island slice: Code Engineer and QA Navigator, each a mature/professional 2.8–3.2-head-tall chibi/stylized humanoid rather than an infant or mascot.
- Brief, plan, build, QA, release, observe, and proof states have meaningful text and matching visual actions.
- Details, verified live-product, and verified proof destinations are direct semantic links.
- All essential content is reachable with keyboard and screen reader and remains available with reduced motion.
- Mobile is a deliberate vertical island sequence; it is not a scaled-down desktop scene.
- English and Korean remain complete at 200% zoom without clipped fixed-height content.
- The implementation uses no invented URLs, decorative fake telemetry, robot imagery, project vessels, or dark control-room framing.
- Reference parity is supported by the present approved image, its SHA-256, comparison screenshots, and an independent review receipt.

## 8. Verification and evidence policy

Each implementation wave gets a task-specific adaptive harness and records exact commands, outputs, screenshots, hashes, and reviewer identity. A builder may not self-certify a visual PASS. The approved visual receipt is present and hashed, but the master runtime task remains `PARTIAL` until implementation and independent comparison are complete.
