# SidequestLab Homepage Design System

## 0. Direction authority

This document is the visual and interaction source of truth for the homepage vertical slice. It supersedes the previous editorial-workshop, dark operations-canvas, industrial robot, and projects-as-vessels directions.

- Approved direction: bright, premium 2.5D cozy-RPG archipelago.
- Approval date: 2026-07-21.
- Approved visual receipt: `docs/references/archipelago/approved-visual-v1.png`.
- Receipt state: present as a 1536×1024 PNG and bound by SHA-256 in `docs/references/archipelago/reference-manifest.json`. Reference-fidelity still requires implementation screenshots and an independent comparison before PASS.
- Interpretation rule: preserve the reference’s composition, bright material quality, map/detail relationship, responsive hierarchy, and mature chibi character proportions. Its placeholder names, percentages, versions, timestamps, and links are not product facts. The explicit two-visible-Wayfarer and named-project contracts in this document control runtime facts.
- Product promise: visitors explore a living portfolio, while every attractive object leads to understandable product facts, direct destinations, and verifiable proof.

The visitor is an observer and explorer, not a captain, employee, or game player. The archipelago is a navigation metaphor; it must never obscure the fact that this is a public portfolio.

## 1. Atmosphere and identity

The homepage opens as a sunlit miniature world seen from a stable three-quarter orthographic camera. Clear aqua water, pale sand, fresh greenery, warm coral, and small hand-built landmarks create an optimistic atmosphere. Premium comes from disciplined composition, material consistency, controlled detail, and excellent type—not from darkness, gloss, or ornamental complexity.

The visual hierarchy is always:

1. SidequestLab identity and plain-language value proposition.
2. Three unmistakably different project islands.
3. Current lifecycle activity expressed as meaningful world action.
4. Direct project, service, and proof links.
5. Supporting evidence, freshness, and availability.

Avoid pirate themes, survival-game framing, babyish or toy-box excess, generic SaaS glass panels, cyberpunk control rooms, industrial robots, and decorative telemetry. Premium chibi/stylized humanoids are part of the approved direction; do not “correct” them toward realistic adult proportions.

## 2. Color tokens

| Role | Token | Value | Usage |
|---|---|---:|---|
| Sky wash | `--arch-sky` | `#DDF3F3` | Upper atmosphere and quiet page surface |
| Horizon | `--arch-horizon` | `#B9E5E2` | Distant haze and depth separation |
| Water light | `--arch-water-light` | `#69CDC4` | Sunlit shallows |
| Water deep | `--arch-water-deep` | `#257E83` | Navigation field and high-contrast water edges |
| Foam | `--arch-foam` | `#F7FFF8` | Shore highlights and focus-adjacent separation |
| Sand | `--arch-sand` | `#E8C983` | Beaches and warm neutral landmarks |
| Grass | `--arch-grass` | `#7BBE67` | Primary living terrain |
| Forest | `--arch-forest` | `#397457` | Terrain shadow and botanical contrast |
| Coral | `--arch-coral` | `#EE7459` | Primary action and warm activity accent |
| Gold | `--arch-gold` | `#E5AA45` | Proof, verified outcomes, and small highlights |
| Paper | `--arch-paper` | `#FFF9EC` | Text cards and evidence surfaces |
| Ink | `--arch-ink` | `#17343A` | Primary text and structural strokes |
| Muted ink | `--arch-muted` | `#557379` | Secondary copy and metadata |
| Danger | `--arch-danger` | `#A43F3B` | Error or unavailable state only |

Rules:

- Ink on paper is the default reading pair. Muted ink is reserved for large or secondary text and must meet WCAG AA at its rendered size.
- Coral means primary action or current selection. Gold means proof or verified outcome. Neither is general decoration.
- Status never relies on color alone; pair color with text, icon, shape, or pattern.
- Water must remain lighter and more chromatic than a dashboard background. No charcoal dominant surface.
- Tokens may be adjusted after the approved image is ingested, but semantic roles must remain stable.

## 3. Typography

Use the existing local/system sans and mono stacks; this foundation does not add font dependencies.

| Role | Size | Weight | Line height | Guidance |
|---|---|---:|---:|---|
| Display | `clamp(2.75rem, 6vw, 5.75rem)` | 850–900 | 1.02 | Short homepage promise only |
| H1 | `clamp(2.25rem, 4vw, 4rem)` | 800–900 | 1.08 | Major scene title |
| H2 | `clamp(1.5rem, 2.5vw, 2.5rem)` | 750–850 | 1.18 | Island and proof sections |
| H3 | `1.125rem–1.375rem` | 700–800 | 1.3 | Project cards and landmarks |
| Body | `1rem–1.125rem` | 400–550 | 1.65 | Product explanation |
| Small | `0.875rem` | 450–650 | 1.55 | Evidence summaries |
| Label | `0.75rem` | 650–750 | 1.35 | Lifecycle and freshness labels |

- Rounded, friendly letterforms are welcome; novelty fantasy fonts are not.
- Korean copy uses `word-break: keep-all` where it improves phrase integrity.
- Mono is limited to dates, identifiers, and compact evidence metadata. It is not the world’s personality.
- Headings and links must remain real text, never baked into imagery.

## 4. Spatial system and camera

### Camera contract

- Use a true or visually convincing orthographic projection at a fixed three-quarter angle: approximately 35° elevation and 45° horizontal rotation.
- Parallel world edges remain parallel. Do not introduce perspective zoom or camera tilt between states.
- North/up-screen orientation remains stable across all islands and responsive modes.
- The sun is fixed upper-left/front; key shadows fall lower-right/back. Ambient fill stays cool and soft.
- Selection may translate an island slightly or change framing, but must not rotate the world.

### Material contract

- Terrain: matte painted plaster with broad color planes and restrained edge rounding.
- Foliage: clustered paper-clay or soft low-poly forms; never photorealistic.
- Buildings: warm wood, painted masonry, cloth, glass, and ceramic accents.
- Water: translucent color bands, shallow foam lines, and limited specular highlights.
- Shadows: soft contact shadows plus one coherent directional shadow. Avoid ambient-occlusion grime.
- Detail budget: every prop should communicate project identity, lifecycle action, navigation, or proof.

### Layout contract

Desktop (`>= 1024px`) uses a composed map stage with a readable text/proof rail. The map is the primary visual, but it never becomes the only route to content. Target a comfortable 1440px composition and validate from 1024px through wide screens.

Tablet (`768–1023px`) keeps the shared archipelago scene with reduced decorative density and an island detail drawer below or beside it.

Mobile (`< 768px`) is a deliberate vertical journey: promise, compact archipelago overview, then one accessible island diorama/card per project. Do not shrink the desktop map into an unreadable miniature. Preserve the same information architecture and direct links.

All layouts support 200% zoom, reflow without horizontal reading scroll, and a minimum 16px body size.

## 5. Reusable scene and interface primitives

| Primitive | Responsibility | Required states |
|---|---|---|
| `ProofHero` | Identity, promise, human-readable operating model, primary portfolio action | default, compact |
| `ArchipelagoMap` | Spatial overview and project selection with equivalent list navigation | default, keyboard-focus-within, reduced-detail |
| `ProjectIsland` | Unique project silhouette, name, status, and selection target | default, hover, focus-visible, selected, unavailable |
| `ProjectDiorama` | Focused project story with landmarks, activity, outcomes, and links | loading, ready, stale, unavailable |
| `WayfarerPair` | Exactly two visible non-robot AI Wayfarers on the selected-island slice: Code Engineer and QA Navigator | working, reviewing, observing, resting, reduced-motion |
| `NavigatorBoat` | Visitor selection transition between islands; never a project representation | docked, navigating, reduced-motion |
| `LifecycleAction` | Maps real project stage to a legible world action and text label | brief, plan, build, qa, release, observe, proof |
| `DirectLinkDock` | Explicit links to details, live service, source when public, and evidence | available, absent, external |
| `ProofRail` | Outcomes, evidence links, timestamps, and availability | verified, stale, unavailable |
| `FreshnessMark` | Human-readable update time and data state | live, recent, stale, unknown |

Every interactive primitive needs default, hover, `:focus-visible`, active/selected, disabled or unavailable where applicable, and reduced-motion behavior. Hover may add delight but cannot reveal unique required information.

## 6. Vertical-slice island differentiation

| Project | Silhouette | Palette bias | Signature landmarks | Evidence hook | Primary action |
|---|---|---|---|---|---|
| DisplayLab | Terraced crescent island with an open presentation cove | Aqua, coral, pale stone | Outdoor display pavilion, color swatch garden, projection sail | Before/after visual proof and shipped interface links | Explore DisplayLab |
| BookSalon | Rounded garden island around a quiet central courtyard | Forest, cream, gold | Reading house, book terraces, lantern path, communal table | Community/product outcomes and current service link | Visit BookSalon |
| N-Bang | Split neighborhood island joined by a practical bridge | Grass, sand, warm terracotta | Shared home clusters, ledger kiosk, equal-share bridge markers | Calculation/trust proof and direct product link | Open N-Bang |

Differentiation must remain recognizable in silhouette at mobile width and in monochrome. Do not rely on palette alone. Future islands must add a distinct landform, landmark family, and evidence behavior rather than reskinning one template.

## 7. Wayfarer character rules

The selected-island vertical slice shows exactly two visible AI Wayfarers: one Code Engineer and one QA Navigator. Korean `3등신` describes character proportion, not party size: each Wayfarer is a cute, premium chibi/stylized humanoid approximately 2.8–3.2 heads tall.

- Chibi is intentional. Preserve a mature, professional reading through poised expressions, purposeful work, considered clothing, restrained detail, and role-specific tools.
- They are humanoid Wayfarers, not infants, baby mascots, robots, drones, armored mascots, or human employees.
- Code Engineer cues cover chart/plan, build, release, and technical care; QA Navigator cues cover inspection, QA, observe, and proof.
- Favor cloth, satchels, notebooks, tools, lenses, maps, banners, and lanterns.
- Prohibit metal chassis, screens for faces, antennae, exposed mechanical joints, control-room consoles, factory arms, and military or pirate styling.
- Avoid pacifiers, toddler poses, oversized nursery props, plush-toy anatomy, slapstick expressions, and merchandise-mascot posing.
- Characters support the project story; they never block names, links, or evidence.
- Copy uses the verified roles Code Engineer and QA Navigator and may describe the pair as AI Wayfarers; never imply employees or autonomous legal actors.

## 8. Lifecycle and motion semantics

| Lifecycle stage | World action | Required textual meaning |
|---|---|---|
| Brief | Raise a signal flag, receive a letter, gather at a marker | Understanding the request |
| Plan | Unroll a chart, place route markers | Planning the work |
| Build | Assemble a landmark, tend a working plot | Building the product |
| QA | Inspect with lens/checklist, test a bridge or path | Verifying quality |
| Release | Light a harbor beacon, open a gate | Releasing a usable result |
| Observe | Survey from a lookout, tend instruments | Monitoring outcomes |
| Proof | Archive a record, pin a gold seal, share a field note | Publishing evidence |

Motion communicates state change, causality, or navigation. It is not a constant screensaver.

- Ambient water/foliage motion is subtle, low-frequency, and may pause offscreen.
- Lifecycle action plays on meaningful data change, not on every render.
- The navigator boat moves only after user selection; it never implies the project itself is a vessel.
- Selection transitions target 240–420ms and avoid large parallax or zoom.
- `prefers-reduced-motion: reduce` makes navigation and state changes immediate, removes bobbing/parallax, and preserves the final meaningful pose.
- Save-Data, background tabs, and offscreen scenes receive static or reduced-detail rendering.
- No autoplay audio, flashing, rapid particles, or essential timed interaction.

## 9. Proof-first content and direct paths

Each project must expose, in real semantic HTML:

1. Project name and one-sentence purpose.
2. Current lifecycle stage and plain-language activity.
3. At least one concrete outcome or proof summary.
4. Freshness or “last updated” state.
5. A direct details link.
6. A live-service link when verified and available.
7. An evidence/proof link when verified and available.

The same destinations must be reachable without operating the scene. Canvas, WebGL, or image-map rendering requires an adjacent semantic list using the same source data. Links never disappear merely because a proof artifact is unavailable; show the unavailable state and explain it.

Do not invent URLs. Use only verified repository data and the deployment URL source of truth.

## 10. Accessibility and localization

- All map selections and links are keyboard reachable in a logical order. Selection is not focus.
- Interactive targets are at least 44×44 CSS px; visible focus uses a high-contrast foam/ink or ink/coral treatment.
- Provide an accessible project list and concise scene description. Decorative props are hidden from assistive technology.
- Island name, stage, activity, freshness, and link availability are announced as text.
- Provide non-color selected and status indicators.
- English and Korean must support expansion without fixed-height clipping. Do not embed localized text in raster art.
- Preserve meaningful content when images fail, JavaScript is delayed, motion is reduced, or high-contrast preferences are active.
- Validate WCAG 2.2 AA contrast for all text and controls after tokens are implemented.

## 11. Acceptance gates and negative criteria

The primitive showcase and vertical slice cannot be accepted until they demonstrate:

- A stable orthographic scene and coherent upper-left lighting.
- Three silhouette-distinct islands matching the differentiation matrix.
- Exactly two visible non-robot Wayfarers on the selected island, using Code Engineer and QA Navigator role cues and 2.8–3.2-head-tall premium chibi proportions.
- Lifecycle motion with an equivalent reduced-motion state.
- Keyboard, screen-reader, mobile, 200% zoom, Korean, and link-path coverage.
- Proof-first project facts and verified direct destinations.
- Comparison against the approved reference receipt (`108ca8b0200bc7cb983b8e50d2dcb50ffb5dc554b3fad9d6a78052f8023dfe88`) with implementation screenshots and independent review.

Reject any implementation that makes projects into boats, uses robots or industrial control-room language, removes the approved premium chibi proportions, renders the characters as infants/mascots, hides proof behind scene interaction, introduces unverified URLs, turns mobile into a scaled desktop map, or treats decorative animation as operational truth.
