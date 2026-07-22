# Living Archipelago session handoff — 2026-07-22

## Repository checkpoint

- Repository: `sidequestlab-homepage`
- Root: `/Users/namseokyoo/orca/workspaces/SidequestLab/feature-homepage_dashboard/projects/sidequestlab-homepage`
- Branch: `feature/homepage_dashboard`
- Origin: `https://github.com/namseokyoo/sidequestlab-homepage.git`
- Pre-checkpoint baseline: `63c8fefb009a653a582f9c879ad144df11c1e9bd`
- Living Portfolio commit: `9df8c99` (`feat: add living portfolio homepage experience`)
- Living Archipelago commit: `9604786` (`feat: add living archipelago preview`)
- Push/deploy: not performed

The public homepage still renders the Living Portfolio workshop. The new
Archipelago is isolated at `/{locale}/archipelago-preview` and remains a
preview-only, no-index surface.

## Verified state

Run from the repository root on 2026-07-22:

- `npm test`: PASS, 59/59 tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS, Next.js 16.1.5, 85 generated routes/pages.
- Sensitive-value pattern scan: no findings in committed scope.
- `git diff --check`: PASS.
- Test server: stopped; port 3117 was free at the end of review.
- Native subagents: none running at checkpoint time.

The Node test command emits `MODULE_TYPELESS_PACKAGE_JSON` performance
warnings. They are non-blocking and do not indicate a failed test.

## Current product verdict

Automated browser behavior previously passed 12/12 runs, 164/164 checks, and
10/10 special lanes. A newer direct visual review on 2026-07-21 used fresh
desktop/mobile captures and two independent critics. Its product verdict is
`REVISE`, not visual acceptance.

Strengths to preserve:

- Three project islands are visually distinct and share a coherent bright
  2.5D material system.
- Wayfarers are appealing non-robot, approximately three-head-tall characters.
- Project facts, truth disclosures, links, dialogs, keyboard behavior,
  reduced-motion handling, and responsive overflow behavior are sound.
- Desktop project focus art is project-specific and sufficiently detailed.

## Next implementation order

### P0

1. On mobile, render the selected project's complete detail immediately below
   the selected scene. Do not leave it in fixed catalog order behind unrelated
   project cards.
2. Replace the mobile `object-position` pan of one overview image with
   project-specific focus art or authored per-project mobile crops.
3. Recalibrate mobile crew anchors so feet and contact shadows land on authored
   walkable surfaces.

### P1

1. Integrate/compress the desktop hero and metrics into the stage so the world
   owns most of the 1440×900 first fold.
2. Add state-bearing navigator/route motion and sparse snapshot-backed crew
   action cycles. Decorative motion alone is insufficient.
3. Do not render full-color in-world crew for projects with no published crew
   activity; use an unmistakably symbolic or off-island guide treatment.
4. Keep active crew state visible at phone widths instead of hiding the state
   text entirely.
5. Collapse preview controls or place them behind preview/development chrome.
6. Correct the identified 320px Korean semantic phrase breaks.
7. Convert large PNG delivery assets to WebP/AVIF and measure transferred bytes
   and LCP before public cutover.

## Resume procedure

1. Open this exact workspace and repository.
2. Run `git log -5 --oneline` and confirm `9604786` plus the evidence commit
   containing this handoff.
3. Run `git status --short`; local generated evidence directories are ignored.
4. Run `npm test && npm run typecheck && npm run lint` before new edits.
5. Start the preview only when needed:

   ```bash
   npm run dev -- --hostname 127.0.0.1 --port 3117
   ```

6. Implement P0 mobile hierarchy/focus work before desktop polish or public
   homepage cutover.

Do not push, deploy, or replace the public homepage until a fresh independent
visual review approves the revised desktop and mobile captures.
