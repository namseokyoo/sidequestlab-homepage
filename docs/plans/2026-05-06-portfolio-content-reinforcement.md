# Portfolio Content Reinforcement Implementation Plan

> **For Hermes:** Use direct implementation with separate verification evidence for this bounded homepage/content task.

**Goal:** Strengthen SidequestLab homepage content so visitors understand what the lab does, what proof exists, and why the portfolio is credible.

**Architecture:** Keep the existing editorial homepage design. Add a focused proof narrative section between the hero and project grid, refresh KO/EN copy, and bind the work to an adaptive harness/final report.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, next-intl JSON copy, MDX blog content.

---

### Task 1: Create content-specific harness

**Objective:** Define acceptance criteria before editing public-facing copy.

**Files:**
- Create: `docs/reports/2026-05-06-portfolio-content-reinforcement-harness.md`

**Steps:**
1. Record `task_id`, source-of-truth updates, negative criteria, and evidence requirements.
2. Require KO/EN verification and no invented external metrics.
3. Require lint/build/browser evidence and final report gate.

### Task 2: Add homepage proof narrative section

**Objective:** Add a concise content layer explaining what the portfolio proves.

**Files:**
- Create: `src/components/home/OperatingProofSection.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Steps:**
1. Create a locale-aware component with 3 proof pillars, an operating loop, and CTA links.
2. Insert it after `PortfolioLanding` and before featured projects.
3. Keep copy concrete: services, harness, public evidence, operating loop.

### Task 3: Refresh KO/EN homepage and project copy

**Objective:** Make the existing content more portfolio/outcome-oriented.

**Files:**
- Modify: `messages/ko.json`
- Modify: `messages/en.json`
- Modify: `src/lib/projects.ts`
- Modify: `src/components/home/EditorialHeroPanel.tsx`

**Steps:**
1. Tighten hero subtitles and featured project subtitle.
2. Update editorial latest log to a real homepage/harness milestone.
3. Improve showcased project descriptions/headlines without claiming unverified external numbers.

### Task 4: Verify content and visual integrity

**Objective:** Prove the content reinforcement did not break the site.

**Commands:**
- `npm run lint`
- `npm run build`
- Playwright/browser checks for `/ko` and `/en`
- Screenshot evidence for KO/EN desktop/mobile
- Adaptive harness final-report validation from SidequestLab root

### Task 5: Commit, PR, checks, merge

**Objective:** Land the work through GitHub Flow.

**Steps:**
1. Stage only content/source/report files; exclude `.omx/**` and `.claude/**` runtime residue.
2. Commit with conventional message.
3. Push with `HOME=/Users/namseokyoo` if needed.
4. Create PR, watch checks, squash merge, sync main.
