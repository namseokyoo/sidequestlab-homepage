# Living Archipelago asset receipt v1

- Date: 2026-07-21
- Generator: built-in `imagegen` (`stylized-concept`)
- Approved lineage source: `approved-visual-v1.png`
- Scope: visual reference and raster assets only; no runtime UI source was changed

## Artifact inventory

| Artifact | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `docs/references/archipelago/approved-visual-v1.png` | 1536×1024 | 2,413,135 | `108ca8b0200bc7cb983b8e50d2dcb50ffb5dc554b3fad9d6a78052f8023dfe88` |
| `public/images/archipelago/archipelago-scene-v1.png` | 1536×960 | 2,682,480 | `1abe530a811b700beb2aed0cba5347b8ca7e62137234394a8d0e98399b250057` |
| `public/images/archipelago/archipelago-mobile-v1.png` | 941×1672 | 2,612,924 | `ea1ef80b1886b76d4c898fb1c231f08fc6834bc71cc19032fb86ab89fefece43` |

`approved-visual-v1.png` is a non-destructive byte-for-byte copy of the approved concept. The generated landscape was center-cropped from 1536×1024 to the requested 16:10 1536×960 final framing; no generative or compositing edit was applied after that crop.

## Landscape generation prompt

```text
Use case: stylized-concept
Asset type: production website background scene, 16:10 landscape
Input image: the provided approved Living Archipelago visual is the exact style, palette, materials, lighting, isometric camera, and visual-lineage reference.
Primary request: derive a pure full-bleed Living Archipelago scene with exactly three islands and one small Navigator boat.
Scene/backdrop: bright turquoise sea, airy pale-blue sky, tiny soft clouds, sparkling water paths between the islands, warm sunlight, whimsical miniature archipelago.
Island identities without written labels: ATLAS is the largest central workshop/observatory forge island with teal roofs, brass details, telescope, wind turbine, worktable, dock, and exactly two cute non-robot human Wayfarers working together; HARBOR is a lush lower-left greenhouse/service island with market awning and docks; LUMEN is a lower-right glass conservatory/research island with warm amber light and crystals. Exactly three islands total, no extra islets that could read as projects.
Characters: exactly two friendly human Wayfarers on ATLAS, stylized three-head-tall chibi proportions, one boy and one girl, warm expressive faces, practical explorer-maker clothing, clearly human and not robots. No other people or character figures anywhere.
Boat: exactly one small cream-and-teal Navigator boat traveling on the water between islands.
Style/medium: polished bright storybook 3D/isometric miniature, tactile stone/wood/glass/brass, lush flowers and greenery, charming cozy details, matching the approved reference.
Composition/framing: full-bleed 16:10 world art, ATLAS centered and dominant, HARBOR lower left, LUMEN lower right, generous water margins for responsive cropping; no browser frame, no phone frame, no panels.
Constraints: preserve the approved reference's bright adorable tone, teal/ivory/gold palette, material rendering, scale, and top-down 3/4 perspective.
Avoid: absolutely no UI, no browser chrome, no phone mockups, no cards, no overlays, no badges, no buttons, no progress bars, no icons, no logos, no typography, no letters, no numbers, no signage text, no island-name text, no watermarks; no robots; no extra islands; no extra boats; no dark cyberpunk or neon mood.
```

## Mobile generation prompt

```text
Use case: stylized-concept
Asset type: production website mobile scene, tall 9:16 portrait
Input image: the provided pure Living Archipelago scene is the exact subject, style, palette, materials, character identity, and visual-lineage reference.
Primary request: create a portrait mobile reframing of the same scene, preserving exactly the same three-island world and inhabitants.
Composition/framing: tall 9:16 full-bleed art with ATLAS as the dominant upper-center island, HARBOR below left, LUMEN below right, and the single Navigator boat visible in the water between them. Keep all three islands completely readable inside safe margins for a mobile viewport. This is a responsive art crop/recomposition, not a new design.
Characters: preserve exactly two cute non-robot human Wayfarers on ATLAS, one boy and one girl, three-head-tall chibi proportions. No other people or figures.
Style/medium: identical bright storybook 3D/isometric miniature, turquoise sea, airy sky, warm sunlight, teal/ivory/gold palette, tactile stone/wood/glass/brass, lush greenery and flowers.
Constraints: exactly three islands total, exactly one boat, exactly two people; preserve the architecture and island identities from the reference.
Avoid: absolutely no UI, no browser or phone frame, no panels, no cards, no overlays, no buttons, no progress bars, no icons, no logos, no typography, no letters, no numbers, no signage text, no island-name text, no watermarks; no robots; no extra islands; no extra boats.
```

## Visual inspection receipt

Both final public images were opened directly at original detail with `view_image` after the product baseline was sealed.

- `archipelago-scene-v1.png`: PASS — exactly three islands, exactly two human Wayfarers on the dominant ATLAS island, exactly one Navigator boat, bright approved visual lineage, no embedded UI, text, phone/browser frame, labels, logo, or watermark.
- `archipelago-mobile-v1.png`: PASS — the same three islands and cast remain fully legible in the portrait composition; no embedded UI, text, phone/browser frame, labels, logo, or watermark.
- File checks: PASS — all three files are non-empty PNGs and the final hashes, byte counts, and pixel dimensions match the inventory above.

## Residual risks

- These are generated raster assets, so future project-specific art changes should create versioned siblings rather than overwrite v1.
- The mobile asset is a generated portrait recomposition, not a literal pixel crop; visual lineage and subject counts were verified manually.
- Asset optimization and runtime loading policy are intentionally outside this receipt and must be evaluated when the UI consumes the images.
