# Living Archipelago clean-scene and Wayfarer asset receipt

- Date: 2026-07-21
- Generator: built-in `imagegen`
- Scene edit mode: `precise-object-edit`
- Wayfarer generation mode: `stylized-concept` plus local chroma-key removal
- Scope: versioned raster assets and this receipt only; no UI or runtime code changed
- Source scenes: `archipelago-scene-v1.png` and `archipelago-mobile-v1.png`
- Style reference for Wayfarers: `archipelago-scene-v2-clean.png`

## Artifact inventory

| Artifact | Dimensions | Alpha | Bytes | SHA-256 |
| --- | ---: | :---: | ---: | --- |
| `public/images/archipelago/archipelago-scene-v2-clean.png` | 1536×960 | no | 2,676,413 | `332a230fd05058c3031b746b6a34e9092ad3a9a6b32701c08776a921cb22b764` |
| `public/images/archipelago/archipelago-mobile-v2-clean.png` | 941×1672 | no | 2,582,174 | `16d45fd3ba3694347f443e7bd4408f6b32a1c0d9044c449fb0d6e4ae56fe4256` |
| `public/images/wayfarers/code-engineer-v1-poses.png` | 1254×1254 | yes | 878,588 | `c34783b5f2e53f5fb35742fe2ec18afb4b6e56c37ff59c0b45efb407ed36c5e1` |
| `public/images/wayfarers/qa-navigator-v1-poses.png` | 1254×1254 | yes | 907,070 | `9c9c15aff8e0f4de1f42dde0cb1bb5d13763e761fcc1a9abdad3d0a41987bacd` |

The v1 scenes remain unchanged. The built-in landscape edit returned 1586×992 and was mechanically resampled to the v1 production dimensions of 1536×960. The mobile edit already matched the v1 dimensions and was not resampled.

## Landscape clean-scene prompt

```text
Use case: precise-object-edit
Asset type: production website background scene, 16:10 landscape
Input images: Image 1 is the edit target.
Primary request: remove only every boat and every human/person/Wayfarer from Image 1. There is one small boat in the water near the center and exactly two human characters on the upper central island; remove all three subjects completely.
Repair: reconstruct the water beneath the removed boat with matching turquoise ripples, sparkle paths, and underwater stones; reconstruct the workshop terrace behind the removed people with the same existing worktable, tools, paving, plants, railings, and coherent shadows. Do not add replacements, silhouettes, animals, vehicles, mannequins, statues, or character-like objects.
Invariants: keep exactly the same three distinct islands, their architecture, docks, plants, observatory, conservatories, crystals, scale, positions, full composition, 2.5D orthographic camera, bright premium cozy rendering, palette, lighting, sky, water, and 1536x960 landscape framing. Change only the boat and people removal plus natural background reconstruction.
Constraints: exactly three islands total; zero boats; zero people or humanoid figures; no new subjects; no UI, browser/phone frame, panels, labels, typography, logos, or watermark. Preserve all other pixels and visual identity as faithfully as possible.
```

## Mobile clean-scene prompt

```text
Use case: precise-object-edit
Asset type: production website background scene, tall portrait mobile
Input images: Image 1 is the edit target.
Primary request: remove only every boat and every human/person/Wayfarer from Image 1. There is one small boat in the water near the center and exactly two human characters on the upper central island; remove all three subjects completely.
Repair: reconstruct the water beneath the removed boat with matching turquoise ripples, sparkle paths, and underwater stones; reconstruct the workshop terrace behind the removed people with the same existing worktable, tools, paving, plants, railings, and coherent shadows. Do not add replacements, silhouettes, animals, vehicles, mannequins, statues, or character-like objects.
Invariants: keep exactly the same three distinct islands, their architecture, docks, plants, observatory, conservatories, crystals, scale, positions, full portrait composition, 2.5D orthographic camera, bright premium cozy rendering, palette, lighting, sky, water, and tall mobile framing. Change only the boat and people removal plus natural background reconstruction.
Constraints: exactly three islands total; zero boats; zero people or humanoid figures; no new subjects; no UI, browser/phone frame, panels, labels, typography, logos, or watermark. Preserve all other pixels and visual identity as faithfully as possible.
```

## Code Engineer Wayfarer prompt

```text
Use case: stylized-concept
Asset type: production website character sprite/state pose sheet for CSS layering and animation
Input images: Image 1 is a style, palette, materials, scale, lighting, and 3/4 orthographic camera reference only; do not copy its scenery.
Primary request: create one consistent Code Engineer Wayfarer character identity shown in exactly four full-body state poses arranged as a precise evenly spaced 2-by-2 sprite sheet. Top-left idle; top-right walking step; bottom-left using a compact hand tool; bottom-right cheerful completion gesture.
Subject: friendly clearly human non-robot adult, 2.8–3.2-head-tall chibi proportions, warm expressive human face, dark sculpted hair, warm coral workshop jacket over ivory shirt, practical tan trousers and boots, small brass-and-teal hand tool. Keep identical face, hair, body proportions, outfit, colors, and orthographic scale in all four poses.
Style/medium: premium cozy storybook 2.5D/3D miniature matching Image 1, tactile fabric/leather/brass materials, clean rounded silhouette, readable at 48–96 CSS pixels.
Composition/framing: four equal cells in a strict 2x2 grid, consistent character baseline and size, generous separation and outer padding, 3/4 orthographic front-right view, every limb and tool fully visible; no cell borders or labels.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local removal. Background must be one perfectly uniform color with no shadow, gradient, texture, reflection, horizon, floor plane, lighting variation, or contact shadow.
Constraints: exactly one character identity repeated in exactly four poses; clearly human face with visible eyes, nose, and mouth; crisp antialiased edges; do not use #ff00ff anywhere in the subject; no cast shadow; no reflection; no text; no letters; no UI; no logo; no watermark.
Avoid: screen face, helmet visor hiding the face, antenna, robot shell, mechanical limbs, armor, mascot suit, paper-doll flatness, extra characters, extra props, scenery, islands, boats, icons, panels, dividing lines.
```

## QA Navigator Wayfarer prompt

```text
Use case: stylized-concept
Asset type: production website character sprite/state pose sheet for CSS layering and animation
Input images: Image 1 is a style, palette, materials, scale, lighting, and 3/4 orthographic camera reference only; do not copy its scenery.
Primary request: create one consistent QA Navigator Wayfarer character identity shown in exactly four full-body state poses arranged as a precise evenly spaced 2-by-2 sprite sheet. Top-left idle; top-right walking step; bottom-left actively scanning with a compact handheld scanner; bottom-right cheerful verified/completion gesture.
Subject: friendly clearly human non-robot adult woman, 2.8–3.2-head-tall chibi proportions, warm expressive human face, dark chestnut hair tied in a practical bun, teal-and-blue field jacket over ivory shirt, navy practical trousers and boots, small brass-and-teal handheld scanner with no readable display. Keep identical face, hair, body proportions, outfit, colors, and orthographic scale in all four poses.
Style/medium: premium cozy storybook 2.5D/3D miniature matching Image 1, tactile fabric/leather/brass materials, clean rounded silhouette, readable at 48–96 CSS pixels.
Composition/framing: four equal cells in a strict 2x2 grid, consistent character baseline and size, generous separation and outer padding, 3/4 orthographic front-left view, every limb and scanner fully visible; no cell borders or labels.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local removal. Background must be one perfectly uniform color with no shadow, gradient, texture, reflection, horizon, floor plane, lighting variation, or contact shadow.
Constraints: exactly one character identity repeated in exactly four poses; clearly human face with visible eyes, nose, and mouth; crisp antialiased edges; do not use #ff00ff anywhere in the subject; no cast shadow; no reflection; no text; no letters; no UI; no logo; no watermark.
Avoid: screen face, helmet visor hiding the face, antenna, robot shell, mechanical limbs, armor, mascot suit, paper-doll flatness, extra characters, extra props, scenery, islands, boats, icons, panels, dividing lines.
```

## Chroma-key processing

Each Wayfarer sheet was processed independently with the skill-provided helper:

```sh
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input <chroma-source.png> \
  --out <final.png> \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

## Visual and alpha inspection

All four final files were opened directly at original detail with `view_image`.

- Landscape clean scene: PASS — exactly three distinct islands, zero people/humanoids, zero boats, and no added subject, UI, text, logo, or watermark.
- Mobile clean scene: PASS — exactly the same three-island composition remains legible, with zero people/humanoids and zero boats; no added subject, UI, text, logo, or watermark.
- Code Engineer state sheet: PASS — one clearly human, non-robot identity appears in four consistent poses with coral workshop clothing and a compact tool; edges are clean and no magenta fringe is visible.
- QA Navigator state sheet: PASS — one clearly human, non-robot identity appears in four consistent poses with teal/blue field clothing and a compact scanner; the scan glow remains partially transparent and no magenta fringe is visible.
- Alpha validation: PASS — both Wayfarer files are RGBA, alpha extrema are 0–255, all four corner alpha values are 0, and the count of nontransparent magenta-like pixels is 0.
- Code Engineer alpha counts: 1,246,785 transparent, 12,480 partial, 313,251 opaque pixels.
- QA Navigator alpha counts: 1,215,842 transparent, 15,157 partial, 341,517 opaque pixels.

## Residual risks

- Built-in image editing is generative, so the clean scenes preserve the approved composition and visual identity but are not pixel-identical in untouched regions.
- The pose sheets provide four consistent rendered states per identity, not separated anatomical limbs; consumers should use sprite-cell switching or crop layers rather than skeletal animation.
- The QA scanning glow is intentionally semi-transparent and extends left of the scanner; tight runtime cropping must include that effect.
- Small-screen readability was visually reviewed at source scale, but final runtime scale, CSS crop coordinates, and compression remain integration responsibilities.
