# Living Archipelago project-scene and Wayfarer work-strip receipt v3

- Task: `living-archipelago-uiux-recovery-20260721`
- Date: 2026-07-21
- Approved visual: `docs/references/archipelago/approved-visual-v1.png`
- Approved visual SHA-256: `108ca8b0200bc7cb983b8e50d2dcb50ffb5dc554b3fad9d6a78052f8023dfe88`
- Generator selected: Codex Image Generation
- Generator model: unavailable from the provider receipt (`modelUnavailable: true` for both strips)
- Local processing: Node `v22.22.2`, Sharp `0.34.5`, libvips `8.17.3`
- Scope: versioned raster assets, deterministic asset scripts, prompts, manifests, and receipts only

## Provider capability decision

NanoBanana was probed exactly once in the isolated
`tmp/archipelago-recovery/nanobanana-probe/` directory with
`gemini-3.1-pro-preview`. The command exited 0 but explicitly reported that no
image-generation capability was available and produced no `probe.png`.
Because acceptance required a real PNG that passed a full decode, the probe was
rejected and was not retried. The attempt marker, log, and machine-readable
receipt are retained in that directory.

## Scene inventory

| Artifact | Generator output ID | Source SHA-256 | Dimensions | Output SHA-256 |
| --- | --- | --- | ---: | --- |
| `public/images/archipelago/archipelago-scene-v3-projects.png` | `exec-298943f7-1e90-430d-9102-ecb4169fe3ab` | `7d2ba26ad41bb91fba3214d6064c1f4783f67a023a7cf6e946b95669e0cce4d7` | 1536×960 | `83f70adf6fb3088233b35e22a5a58def874b9a3e64bc488860279304480076fa` |
| `public/images/archipelago/archipelago-mobile-v3-projects.png` | `exec-5666ecfa-a2c0-492d-92cf-bfcab10a308c` | `90d8ad84eb37a4e9911948f13d25d45202e8f26a10e2c3d53e9a3989e4b9a3f9` | 941×1672 | `d8410cdc7235ebc8db1fbf964bbb3f65531896b2924accbf3da798b46253a98a` |
| `public/images/archipelago/dioramas/displaylab-focus-v1.png` | `exec-47c98e7c-54bd-4b42-bff0-ca4810a25899` | `4b1beb4f1da42f1b8d70ce64d3cafb196b59b8bb5d5bf7d561c44de24940d73b` | 1280×768 | `294e453acade4faddc3ea99e19d6ba7c0fb1f2a9ce170729ec31e536e2251e4c` |
| `public/images/archipelago/dioramas/booksalon-focus-v1.png` | `exec-287c0b36-755f-4a96-aaec-a8385253e187` | `c36e8ff4fbda57c9a36807e0e36c0bf34fa8e9bf68bef8d5152a3666b0546627` | 1280×768 | `ba53b822023e9c15001c5c0081d0a0c3bbbc76d0a763d53e1ff8353599b56173` |
| `public/images/archipelago/dioramas/nbbang-focus-v1.png` | `exec-fcd58478-d15f-4c94-8321-d25408225abc` | `48e09629fc2721bce7a18e84d7973313813da96e143f1f971400e77fee10cca8` | 1280×768 | `0e020efc9bceccb0b52218d2882b946966c10c65e0a2782570caf5375f91df78` |

Scene transforms use deterministic Lanczos3 cover resizing, centered crop,
PNG compression level 9, and no adaptive filtering. The scene validator fully
decodes every output, binds its exact dimensions and SHA-256, verifies every
chunk CRC through one exact terminal `IEND`, and rejects trailing data and PNG
text metadata. All five production rasters are generated without people; their
actual pixels are presented together in the scene contact sheet below for
independent visual confirmation.

DisplayLab's projection sail, color-calibration boards, optical marks, and
swatch garden are required physical project landmarks. They are treated as
non-semantic visual instrumentation, not product UI. The locked prohibition is
against embedded language, logos, control labels, app chrome, and semantic
software-interface hierarchy; those remain forbidden by the prompt and
manifest contracts.

## Wayfarer strip inventory

| Artifact | Generator output ID | Source SHA-256 | Dimensions | Alpha | Output SHA-256 |
| --- | --- | --- | ---: | :---: | --- |
| `public/images/wayfarers/code-engineer-work-v1.png` | `exec-bd3cc762-1262-47c6-b7cb-e1a3bfcfc6fb` | `af18df0ff7fd4cfcf1317f32d35d1963629fa529e70aed2b3f93b434fff7e653` | 2048×256 | yes | `9ceb4e8704f21803a907e5f1a03d67dddda3c5d2817d32f4dbbd27dbfb62433c` |
| `public/images/wayfarers/qa-navigator-test-v1.png` | `exec-b96a7949-3d48-45f0-a66e-be69715d8d2a` | `6040e20fb884ff14f7940c3d8492048dc1566fed8361a2b6850570a009b83ccb` | 2048×256 | yes | `a1652103b7a4cc82e84742c5b74b194c62a2c8fcbac65872f0e5feb41dea26d7` |

Each selected source is a 4×2 checkerboard-backed sheet. The revised packer
finds a low-foreground gutter near each nominal grid cut, flood-fills only
border-connected low-saturation/light checker and floor-shadow pixels, applies
one neutral-edge cleanup pass, and preserves enclosed light subject detail such
as the Engineer's ivory shirt. Source foreground contact is a hard failure;
all 16 selected source cells report `sourceBoundContact: false`.

The packer then applies common vertical scale, deterministic two-point
registration, at most 12px of bounded baseline shear, 12px pack padding, and
eight 256×256 RGBA cells. Both role manifests declare fixed named anchors:
equipment at `[88,240]` (`workbench-left-ground` or
`test-pedestal-left-ground`) and `rightmost-planted-foot` at `[184,234]`.
The validator independently re-detects both anchors from output alpha. Across
all 16 frames, every equipment and planted-foot X/Y deviation is at most 2px;
the general output ground pivot remains `[128,240]` with at most 2px drift.

The earlier green-background candidates and their generated strips were
rejected by independent technical-art review because several nominal source
cells touched a boundary and detached fragments remained. They are preserved
as historical rejected evidence under
`tmp/archipelago-recovery/historical-rejected/chroma/`:

- Engineer `exec-a29abc24-5481-4ad3-9f74-a9d7441788bc`, source SHA-256 `534aadc3f8dcd728afe26cc1026569359eecfe013dfea1b44bf5c278bb61542e`
- QA `exec-f2888eb7-589e-43a4-b243-bcba8f91bc6f`, source SHA-256 `7e40a1439836cb29aaae2606f2dd4a2577bf2cd8ec7d9391a6d4e26c9da7c499`

## Prompt and provenance binding

The exact prompts and their SHA-256 hashes are bound in
`scene-assets-v3.json` and `wayfarer-work-strips-v1.json`. Each selected asset
also records the generator output ID, copied raw path and SHA-256, exact output
path and SHA-256, processing parameters, runtime versions, and mechanical
status. Pack receipts with per-frame source/placed bounds and key statistics are
under `tmp/archipelago-recovery/processing/` and are independently hash-bound
from the strip manifest. Validators fail closed unless the approved reference,
prompt, provider output ID, raw source, identity reference where applicable,
prepared output, and pack receipt all exist under their repository-local
allowed prefixes and reproduce their declared hashes.
All relative filesystem operations resolve against the script-derived repository
root rather than the caller's working directory; the full self-test and both
real validators also PASS when invoked from `/tmp`.

## Verification status

- Embedded script self-tests: PASS for all four scripts.
- Scene manifest mechanical validation: PASS, five of five assets, including full decode and strict provenance/path bindings.
- Scene contact sheet: `tmp/archipelago-recovery/validation/scenes-final-review/scene-contact-sheet.png`, SHA-256 `f886ee502773c6bca7993913df1d7e707d1de04323e7f0ec083ebc43f6505c6a`, 1280×1200.
- Monochrome scene contact sheet: `tmp/archipelago-recovery/validation/scenes-final-review/scene-contact-sheet-monochrome.png`, SHA-256 `b6465e5633880d4ccc21b375f226df91772e6e7a93d8831a0ba85c489dbd19ac`, 1280×1200; deterministically derived from the same five production rasters without modifying them.
- Scene validation receipt: `tmp/archipelago-recovery/validation/scenes-final-review/scene-validation.json`, SHA-256 `0478c90bf3d10b4cf8b613c81ac358fa2fb0320fb57b0634837213a29ede664d`; the receipt directly binds both scene contact-sheet paths and hashes.
- Wayfarer manifest mechanical validation: PASS, two of two strips and eight of eight cells per strip; no source contact and both named X/Y anchors are receipt-bound.
- 96px composite: `tmp/archipelago-recovery/validation/strips-final-review/wayfarer-contact-sheet-96px.png`, SHA-256 `ecfb1555eec15662b88c4c82f8668ec3d06f5328b98172f6299f89ea1f4bc5c8`, 768×768 over water-light, water-dark, foliage, and paper backgrounds.
- Full-resolution Wayfarer composite: `tmp/archipelago-recovery/validation/strips-final-review/wayfarer-contact-sheet-full.png`, SHA-256 `06eb3215ea3beb7ec982ecb452f3f5b400fc21feabc24e6287596eeb0957d964`, 2048×2048 at 256px per frame over the same four backgrounds; deterministically derived from the two production strips without modifying them.
- Strict strip validation receipt: `tmp/archipelago-recovery/validation/strips-final-review/wayfarer-validation.json`, SHA-256 `977f46c4d8f520786ef30cc96ce83b882edab529294566401e08b74f7e2b14a9`; the receipt directly binds both Wayfarer contact-sheet paths and hashes.
- Negative automation checks: PASS for missing/trailing `IEND`, CRC/structure failures, missing provenance, unsafe repository paths, symbolic-link traversal, mixed CLI modes, and non-PASS validation statuses.
- Builder original-detail and 96px composite inspection: PASS for alpha cleanup, identity, sequence coherence, and foreground/background readability.
- Lead scene/strip direct visual check: PASS for the final scene set, revised strips, monochrome scene sheet, and full-resolution four-background strip sheet.
- Independent technical-art/code/provenance review: `APPROVED` for the final production asset set after the checker-salvage, strict-integrity, and repository-root I/O confinement repairs. The first-pass `REVISE` verdict applies only to the preserved historical chroma strips; it is not the final verdict. This receipt records the independent verdict and does not self-certify final product quality.

## Integration notes and residual risks

- Runtime consumers must use the v3 project scene paths and the new work-strip paths; no UI/runtime integration is performed by this asset task.
- Generated imagery is not pixel-identical to the approved visual. The manifests bind project identity, camera, lighting, landmarks, zero people, no embedded text/logo/semantic UI, and provider provenance for independent comparison. DisplayLab abstract calibration/projection surfaces are an explicit allowed landmark class, not an exception for semantic UI.
- Checker-flood cleanup is deterministic and passes both the 96px and full-resolution multi-background composites; the independent reviewer confirmed the final strips after checking preservation of light costume detail and bounded baseline-shear output.
- Equipment and planted-foot anchors are alpha-derived semantic proxies. Runtime CSS must preserve each 256×256 cell without additional nonuniform scaling if it relies on the declared coordinates.
