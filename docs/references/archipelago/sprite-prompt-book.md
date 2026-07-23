# Archipelago V2 — Sprite Prompt Book

> gpt-image-2 generation guide for all sprite assets.
> Every prompt below is production-ready. Copy verbatim into image_gen.
> Concept review evidence: concept-review-20260723/
> Strengthened with: omer-metin/skills-for-antigravity@pixel-art-sprites (★115, 1.5K installs)

---

## 1. Style DNA (shared block — prepend to EVERY prompt)

> Hardened with pixel-art-sprites patterns: directional light (anti-pillow-shading),
> silhouette-first design, AA-to-transparent-only (anti-halo), outline consistency,
> per-asset color discipline.

```
Animal Crossing: New Horizons style game asset sprite, chibi miniature
diorama aesthetic. Soft cel-shading with a FIXED light source from the
UPPER LEFT at 45 degrees: top-left surfaces catch highlights, bottom-right
surfaces fall into shadow. NEVER shade all edges uniformly dark (that
creates a flat puffy "pillow" look with no depth). Each surface gets
exactly three tones: one highlight (facing light), one base midtone,
one shadow (facing away from light), plus a subtle ambient-occlusion
darkening ONLY at the base where the object meets the ground.
Consistent 2px dark-teal outline (#17343A) around every silhouette edge
AND on major internal feature lines — NOT pure black, uniform weight
across the entire asset, no broken or doubled segments. Rounded, puffy,
slightly exaggerated proportions (chibi scale).
Warm pastel palette locked to these exact hex values:
grass green #7BBE67, deep forest #397457, grass shadow #5FA354,
sand #E8C983, coral #EE7459, gold #E5AA45, stone gray #C8CFC8,
wood brown #A07850, dark wood #7A5C40, cream paper #FFF9EC,
teal water #69CDC4, foam white #F7FFF8.
Painted texture feel: visible soft brush strokes, tiny speckle details,
hand-crafted miniature toy quality.
SILHOUETTE FIRST: the object must be instantly recognizable as a solid
black silhouette at 16px display size — design the outer shape before
adding any internal detail.
Edge handling: hard clean edges against the chroma background — do NOT
anti-alias or blend pixels into the green background (this causes ugly
halos when the background is removed). Any softness must come from
alpha transparency, never from color-mixing with the background.
```

## 2. Technical Constraints (append to EVERY prompt)

> Anti-halo clause added per pixel-art-sprites "anti-alias-halos" pattern.

```
Flat solid #00FF00 chroma-key green background filling the ENTIRE canvas
edge to edge, no gradient, no vignette, no texture on the background.
CRITICAL: the object's edges must be HARD against this green — no
anti-aliased fringe, no color blending into green, no semi-transparent
green-tinted pixels at the boundary. The silhouette edge should look
like a clean paper cutout.
Single object centered with 10% margin padding on all sides.
No ground, no floor, no cast shadow, no drop shadow (contact shadow is
drawn separately by the game engine). No text, no watermark, no logo,
no UI elements, no border frame. PNG game sprite asset.
```

## 3. Viewing Angle Convention

> Per pixel-art-sprites "inconsistent-outline-weight": all assets share
> the same outline style. Viewing angle is consistent so outlines read
> uniformly when composited together.

All assets use the SAME camera: **three-quarter view from slightly above
(~30° elevation), facing the viewer at a gentle angle**. This matches the
isometric-ish diorama camera of the world engine. Exceptions noted per asset.
Light source is ALWAYS upper-left 45° regardless of viewing angle.

---

## 4. Asset Prompts

### Color Budget (per pixel-art-sprites "palette-bloat" pattern)

| Category | Max distinct colors | Rationale |
|---|---|---|
| Particles (leaf, smoke) | 3-4 | Tiny display size, fewer = cleaner |
| Small props (flower, tuft, shell, conch) | 5-6 | Readable at 10-14px |
| Medium props (bush, rock, vine, moss) | 6-8 | Need shadow/highlight ramp |
| Large props (trees, tidepool) | 8-10 | Canopy needs 3-tone ramp + accent |
| Characters (walk frames) | 10-12 | Skin + hair + clothing + outline |

Reject any generated asset that visibly exceeds its color budget
(muddy gradients = too many intermediate colors).

### 4.1 Trees (display height ~40-50 world units, generate 1024×1024, color budget 8-10)

**tree-deciduous.png**
```
[Style DNA] A single round deciduous tree game asset. Thick short trunk
in dark wood brown (#7A5C40) with a gentle S-curve lean, two visible
branch bumps. Trunk lit on its left edge, shadowed on right.
Canopy is a large puffy cloud shape made of 4-5 overlapping
rounded lobes. Light hits from upper-left: upper-left lobes are
highlight green (#A8D98A) with a tiny cream spot (#D4EFC0), center
lobes are base grass green (#7BBE67), lower-right lobes fall into
deep forest shadow (#397457). 3-4 shadow crescents (#5FA354) ONLY
on the lower-right underside of lobes (NOT around all edges).
Two small round fruits in coral (#EE7459) on the lit (upper-left)
canopy edge. [Technical Constraints] [Viewing Angle Convention]
```

**tree-conifer.png**
```
[Style DNA] A single conifer pine tree game asset. Short dark wood trunk
(#7A5C40), lit on left edge. Three stacked rounded triangle tiers,
widest at bottom. Light from upper-left: each tier's upper-left surface
is highlight green (#A8D98A), main face is grass green (#7BBE67),
lower-right underside is deep forest (#397457). Tier edges slightly
curled upward like a puffy skirt. Shadow crescents ONLY under each
tier's right overhang. Bottom tier widest, top tier smallest with a
rounded tip catching the most highlight.
[Technical Constraints] [Viewing Angle Convention]
```

**tree-palm.png**
```
[Style DNA] A single coconut palm tree game asset. Curved leaning trunk
in wood brown (#A07850) with 4-5 horizontal ring segments in dark wood
(#7A5C40), trunk curves ~15° to the right. Trunk lit on left edge,
shadow on right. 5 thick drooping fronds radiating from the top:
upper-left fronds catch highlight green (#A8D98A), mid fronds are
base grass green (#7BBE67), lower-right fronds show forest green
(#397457) underside. Frond edges scalloped with visible leaflet
notches. 2 round coconuts in dark wood brown (#7A5C40) clustered at
the crown base, lit on upper-left. [Technical Constraints]
[Viewing Angle Convention]
```

### 4.2 Vegetation (display ~10-24 world units, generate 1024×1024, color budget 5-8)

**bush.png**
```
[Style DNA] A single round leafy bush game asset. Three overlapping
puffy sphere clusters forming a low wide mound. Light from upper-left:
upper-left cluster is highlight (#A8D98A), center cluster is base
grass green (#7BBE67), lower-right cluster is shadow forest (#397457).
5-6 tiny leaf-bump details on the lit surface. Shadow crescents
(#5FA354) ONLY on the lower-right underside, NOT around all edges.
Width is 1.4× the height (low mound, not a ball).
[Technical Constraints] [Viewing Angle Convention]
```

**flower-coral.png / flower-gold.png / flower-white.png / flower-pink.png**
```
[Style DNA] A single small flower game asset, viewed from a slightly
elevated three-quarter angle. One thin curved stem in forest green
(#397457), lit on left edge, with one tiny leaf halfway up.
Flower head: 5 round overlapping petals in [CORAL #EE7459 |
GOLD #E5AA45 | CREAM WHITE #FFF9EC | PINK #F2A0B5]. Light from
upper-left: upper-left petals are the brightest with a tiny white
highlight dot, lower-right petals are one shade darker. Center:
a round golden (#E5AA45) disc with 3 tiny darker dots. Flower head
diameter is 60% of total height (oversized chibi flower).
Max 5 distinct colors total. [Technical Constraints]
[Viewing Angle Convention]
```

**grass-tuft.png**
```
[Style DNA] A single grass tuft game asset. 5 blades of grass growing
from one base point, fanning outward: center blade tallest and straight,
outer blades curve left and right. Light from upper-left: left-facing
blade surfaces are highlight (#A8D98A), right-facing surfaces are
shadow forest (#397457), midtone is grass green (#7BBE67). Blade
width tapers to a soft point. Base is narrow (20% of total width).
Max 4 distinct colors. [Technical Constraints] [Viewing Angle Convention]
```

### 4.3 Coastal (display ~6-28 world units, generate 1024×1024, color budget 5-8)

**shell.png**
```
[Style DNA] A single small bivalve seashell game asset. Fan-shaped
scallop shell, slightly open, viewed from above at 30°. Light from
upper-left: upper-left surface catches a bright highlight spot,
lower-right falls into shadow. Surface: cream (#FFF9EC) base with
5 radiating ridge lines in warm sand (#E8C983), inner lip has a
soft coral (#EE7459) blush. Outer edge slightly scalloped.
Max 5 distinct colors. [Technical Constraints] [Viewing Angle Convention]
```

**conch.png**
```
[Style DNA] A single spiral conch shell game asset. Classic spiral
conch shape with 3 visible whorls, aperture opening facing lower-right
showing a coral-pink (#F2A0B5) interior. Light from upper-left:
glossy highlight streak on the upper-left of the largest whorl,
shadow on the lower-right whorls. Exterior: warm sand (#E8C983)
base with cream (#FFF9EC) spiral band highlights and 2-3 tiny brown
(#A07850) speckles. Max 6 distinct colors.
[Technical Constraints] [Viewing Angle Convention]
```

**tidepool.png**
```
[Style DNA] A shallow tide pool game asset viewed from above at 30°.
Irregular rounded organic puddle shape. Light from upper-left:
upper-left water surface has 2 small white highlight ripple arcs,
lower-right water is slightly deeper/darker. Water surface: light teal
(#69CDC4) center fading to foam white (#F7FFF8) at the rim edge.
Inside: 3 small rounded pebbles (stone gray #C8CFC8, one with a moss
green #7BBE67 patch), one tiny starfish in coral (#EE7459) with 5
rounded arms. Rim: thin wet-sand edge in darkened sand (#D4B06A).
Max 8 distinct colors. [Technical Constraints] [Viewing Angle Convention]
```

**rock.png**
```
[Style DNA] A single rounded boulder game asset. Low wide rock shape
(width 1.5× height), 2-3 overlapping rounded masses. Light from
upper-left: upper-left face is highlight (#E0E8E0), main face is
base stone gray (#C8CFC8), lower-right face is shadow (#9AABA0).
2-3 tiny crack lines in dark gray (#8A9A90), 3 speckle dots.
Shadow crescent ONLY at the base (ambient occlusion), NOT around
all edges. No moss (see rock-moss-variant). Max 5 distinct colors.
[Technical Constraints] [Viewing Angle Convention]
```

**rock-moss-variant.png**
```
[Style DNA] A single rounded boulder game asset with moss growth. Same
base shape as the plain rock with upper-left light. Stone gray (#C8CFC8)
base, shadow side (#9AABA0) lower-right. Moss: 3 soft green patches
(#7BBE67 base, #397457 shadow on lower-right of each patch) draping
over the top and upper-left surfaces like melted paint, edges organic
and blobby. Moss patches catch the light on their upper-left edges.
One tiny grass sprig (#5FA354) growing from a crack at the top.
Max 7 distinct colors. [Technical Constraints] [Viewing Angle Convention]
```

**rock-mossy.png**
```
[Style DNA] A cluster of 2-3 small mossy rocks game asset, arranged as
one composition. Light from upper-left. Each rock rounded, stone gray
(#C8CFC8) with upper-left highlight, moss patches (#7BBE67) covering
40% of the top surfaces, moss shadowed (#397457) on lower-right.
Rocks overlap slightly, largest in center. Tiny shadow crescents
(#5FA354) between rocks on the lower-right side. Max 7 distinct colors.
[Technical Constraints] [Viewing Angle Convention]
```

### 4.4 Cliff (display ~15-35 world units, generate 1024×1024, color budget 4-6)

**vine.png**
```
[Style DNA] A single hanging vine game asset, viewed straight-on
(front view — it hangs flat against a cliff face). Light from upper-left.
One main stem curving gently downward in forest green (#397457),
length 3× width. 6-8 small round leaves alternating left and right
along the stem: leaves grass green (#7BBE67) with upper-left highlight
vein (#A8D98A) and lower-right shadow edge (#397457), each leaf a
soft teardrop shape. Stem tapers toward the bottom tip, ending in
2 tiny new leaves. Top of stem has a small attachment bump.
Max 4 distinct colors. [Technical Constraints] Front view exception.
```

**moss-patch.png**
```
[Style DNA] A single organic moss patch game asset, viewed straight-on
(front view — it sits flat on a cliff face). Light from upper-left.
Irregular blobby organic shape like melted paint dripping slightly
downward at the bottom edge. Upper-left area is highlight (#A8D98A),
center is base moss green (#7BBE67), bottom-right edge is shadow
forest (#397457). 3-4 tiny grass-blade details poking up from the
top edge, catching light. Soft organic silhouette, no straight lines.
Max 4 distinct colors. [Technical Constraints] Front view exception.
```

### 4.5 Particles (display ~4-8 world units, generate 1024×1024, color budget 3-4)

**leaf.png**
```
[Style DNA] A single small falling leaf game asset, viewed flat
(top-down — it flutters horizontally as it falls). Light from upper-left.
Simple oval leaf shape with a pointed tip and a visible center vein
line. Upper-left half is highlight golden-green (#C8D87A), lower-right
half is base (#B8C96A). Vein slightly darker (#96A854). One edge
slightly curled with a tiny shadow on lower-right. Max 3 distinct colors.
[Technical Constraints] Top-down exception.
```

**smoke-puff.png**
```
[Style DNA] A single soft smoke puff game asset. One puffy round cloud
shape made of 3-4 overlapping soft circles, very low contrast: warm
off-white (#FFF9EC) center fading to soft gray (#E8E4DC) at edges.
NO hard outline on this asset — the outline must be extremely faint
or absent (smoke needs soft edges). Slightly irregular silhouette,
like a cotton ball. Upper-left slightly brighter (light direction).
Max 3 distinct colors. [Technical Constraints]
Exception: NO dark outline for this asset only.
```

### 4.6 Character Walk Cycles (generate 1536×1024 landscape, color budget 10-12)

> Walk cycle timing validated against pixel-art-sprites pattern:
> "walk: 4-6 frames, frame_time: 100-150ms". Our 4 frames at 125ms
> (8fps) is in the sweet spot. "4 great frames > 12 mediocre frames."

**wayfarer-engineer-walk.png**
```
[Style DNA] 4-frame walk cycle sprite sheet of ONE chibi character,
side view facing LEFT. Character: a cute code engineer, 2.5-head
proportions (oversized round head, small body). Round face with big
dark-teal (#17343A) round glasses, messy dark brown hair, teal hoodie
(#3A9490), dark pants (#17343A), small brown shoes (#7A5C40), tiny
silver laptop tucked under the back arm. Light from upper-left:
hoodie lit on left shoulder, shadowed on right side.
FOUR FRAMES in one horizontal strip, equal-width cells separated by
thin #00FF00 gaps. ABSOLUTE PRIORITY: the character is PIXEL-IDENTICAL
in body, head, clothing, colors, and proportions across all four
frames — ONLY the leg positions and arm swing change.
Frame 1 CONTACT: right leg extended forward (heel down), left leg
extended back, left arm forward, right arm back, torso at LOWEST point.
Frame 2 DOWN: weight on front (right) leg, slight knee bend, arms
at sides, torso at HIGHEST point.
Frame 3 PASSING: legs together under body, left leg swinging through,
arms at sides, torso mid-height.
Frame 4 UP: left leg forward about to contact, right leg pushing off,
right arm forward, left arm back, torso rising.
Consistent ground line at the SAME pixel height in every frame.
Consistent character height (top of head to bottom of feet) in every frame.
Max 12 distinct colors across the character.
[Technical Constraints] Side view facing left, all four frames.
```

**wayfarer-qa-walk.png**
```
[Style DNA] 4-frame walk cycle sprite sheet of ONE chibi character,
side view facing LEFT. Character: a cute QA navigator, 2.5-head
proportions. Round face with bright curious eyes, auburn hair in two
short pigtails, coral vest (#EE7459) over cream shirt (#FFF9EC),
teal shorts (#3A9490), small sandals (#A07850), a golden magnifying
glass (#E5AA45) held in the front hand. Light from upper-left:
vest lit on left side, shadowed on right.
FOUR FRAMES in one horizontal strip, equal-width cells separated by
thin #00FF00 gaps. ABSOLUTE PRIORITY: the character is PIXEL-IDENTICAL
in body, head, clothing, colors, and proportions across all four
frames — ONLY the leg positions and arm swing change.
Frame 1 CONTACT: right leg forward heel down, left leg back, left arm
forward (magnifying glass swings forward), torso LOWEST.
Frame 2 DOWN: weight on right leg, knee bend, arms at sides, torso HIGHEST.
Frame 3 PASSING: legs together, left leg through, arms at sides.
Frame 4 UP: left leg forward, right leg pushing, right arm forward,
torso rising.
Consistent ground line and character height in every frame.
Max 12 distinct colors across the character.
[Technical Constraints] Side view facing left, all four frames.
```

---

## 5. Post-Processing Pipeline

```bash
REMOVE="$CODEX_HOME/skills/.system/imagegen/scripts/remove_chroma_key.py"
PY="/Library/Frameworks/Python.framework/Versions/3.12/bin/python3"
SPRITES="public/images/archipelago/sprites"

# Per single asset (soft matte + despill + slight contract for clean edges):
$PY "$REMOVE" --input raw/NAME.png --out "$SPRITES/NAME.png" \
  --soft-matte --transparent-threshold 14 --opaque-threshold 90 \
  --edge-contract 1 --despill --force

# smoke-puff.png exception (no contract, keep soft edges):
$PY "$REMOVE" --input raw/smoke-puff.png --out "$SPRITES/smoke-puff.png" \
  --soft-matte --transparent-threshold 10 --opaque-threshold 110 --force

# Walk sheets: remove key from full sheet first, then split:
$PY "$REMOVE" --input raw/wayfarer-engineer-walk.png \
  --out "$SPRITES/wayfarer-engineer-walk.png" \
  --soft-matte --transparent-threshold 14 --opaque-threshold 90 \
  --edge-contract 1 --despill --force

# Split sheet into 4 equal frames (PIL):
$PY - << 'SPLIT'
from PIL import Image
for role in ("engineer", "qa"):
    src = Image.open(f"public/images/archipelago/sprites/wayfarer-{role}-walk.png")
    w4 = src.width // 4
    for i in range(4):
        frame = src.crop((i * w4, 0, (i + 1) * w4, src.height))
        frame.save(f"public/images/archipelago/sprites/wayfarer-{role}-walk-{i}.png")
SPLIT

# Normalize sizes (PIL resize, LANCZOS):
#   trees → height 256px (preserve aspect)
#   bush/rocks/tidepool → height 128px
#   flowers/tufts/shells/conch/leaf/moss-patch → height 64px
#   smoke-puff → height 48px
#   vine → height 160px
#   walk frames → height 192px
```

## 6. Quality Gates (reject and regenerate if any fail)

> Gates 9-10 added from pixel-art-sprites sharp_edges.md patterns.
> Gate 4 strengthened from 32px to 16px per "1x zoom" rule.
> Gate 3 hardened per "anti-alias-halos" pattern.

1. **Palette drift**: dominant colors must be within ΔE<20 of the locked
   hex values. Eyeball check against concept-review lineup.
2. **Outline consistency** (pixel-art-sprites: inconsistent-outline-weight):
   ~2px dark teal (#17343A), uniform weight across ALL assets, no broken
   segments, no double outlines, internal feature lines same weight as
   silhouette outline.
3. **Chroma cleanliness** (pixel-art-sprites: anti-alias-halos): after
   removal, zero visible green fringe AND zero semi-transparent
   color-mixed pixels at edges (verify at 400% zoom). Edge pixels must
   be either fully opaque object color or fully transparent — no
   green-tinted AA fringe.
4. **Silhouette test** (pixel-art-sprites: "1x zoom" rule): asset
   recognizable as a solid black silhouette at **16px** display size
   (strengthened from 32px).
5. **Walk cycle coherence**: overlay frames at 50% opacity — head/body
   must align within 3px; only legs/arms should differ.
6. **No baked shadows/ground**: bottom edge must be clean object edge,
   no dark ellipse underneath.
7. **Alpha channel**: mode == RGBA, background fully transparent.
8. **Style match**: side-by-side with existing 5 sprites — same line
   weight, same shading softness, same color temperature.
9. **No pillow shading** (pixel-art-sprites: pillow-shading-trap):
   shading must show a clear upper-left light direction. Reject if
   all edges are uniformly darkened (puffy balloon look). Check:
   upper-left surfaces must be visibly lighter than lower-right.
10. **Color budget**: count distinct colors per asset. Reject if
    exceeds the budget in §4 table (muddy gradients = too many
    intermediate colors from AI over-blending).

## 7. Regeneration Strategy

- If an asset fails gate 1-2: regenerate with the SAME prompt (variance).
- If it fails gate 3: adjust remove_chroma_key thresholds before regenerating
  (try --edge-contract 2, --transparent-threshold 18).
- If it fails gate 5: add "ABSOLUTE PRIORITY: identical character geometry
  in all frames" to the prompt and regenerate.
- If it fails gate 9 (pillow shading): add "STRONG directional light from
  upper-left, dramatic difference between lit and shadow sides" and regenerate.
- If it fails gate 10 (color budget): add "LIMITED PALETTE: use ONLY these
  N colors: [list exact hex values]" and regenerate.
- Max 3 attempts per asset. After 3 failures, keep the best attempt and
  note the deviation in the harness evidence.

## 8. Source Attribution

Prompt book hardened with patterns from:
- **omer-metin/skills-for-antigravity@pixel-art-sprites** (GitHub ★115, 1.5K installs)
  - references/patterns.md: walk cycle frame breakdown, color ramp with hue shifting,
    animation timing standards (walk 100-150ms/frame), character proportion templates
  - references/sharp_edges.md: pillow-shading-trap, anti-alias-halos,
    inconsistent-outline-weight, palette-bloat, animation-speed-mismatch
  - references/validations.md: PNG format enforcement, consistent frame sizes
- **dkyazzentwatwa/chatgpt-skills@sprite-sheet-generator**: NOT FOUND (404, repo
  does not contain this skill as of 2026-07-23). Not used.
