---
title: Homepage Visual Polish Adaptive Harness
date: 2026-05-06
task_id: 20260506-homepage-visual-polish
status: active
---

# Homepage Visual Polish Adaptive Harness

```yaml
harness:
  task_id: 20260506-homepage-visual-polish
  task_type: visual
  risk_tier: external-facing
  intent_lock: >
    Improve the SidequestLab public homepage as an AI Operations Portfolio page while preserving the editorial/newspaper + dark system-canvas direction and avoiding generic SaaS drift.
  context_lock:
    references:
      - Baseline: commit 96837df feat: add adaptive portfolio system canvas landing
      - Current user corrections in Discord thread: hero headline wrapping, project-section imbalance, small text contrast, KO/EN completeness
      - Governance hardening: SidequestLab commit 2bdeb9e ops: harden visual reference harness gates
    source_of_truth_update:
      - Hero headline must use keep-all/better clamp so Korean and English do not wrap awkwardly.
      - Project section below hero must feel intentionally balanced, not sparse compared with the first screen.
      - Small gray text in dark areas must be more readable: system-map labels, case labels, blog summaries, footer text, section CTAs.
      - KO and EN must both be checked, including responsive desktop/tablet/mobile states.
    must_preserve:
      - Editorial ivory + charcoal system-canvas mood.
      - Evidence/status language over fake metrics or fake product claims.
      - Existing route structure and no invented deployment URLs.
    allowed_adaptations:
      - Adjust copy density, typography scale, card grid layout, color contrast, and responsive behavior.
      - Fix ThemeToggle hydration mismatch if encountered during QA.
  negative_criteria:
    hard_fail:
      - PASS without desktop/tablet/mobile screenshot evidence.
      - PASS without KO and EN review.
      - PASS while hero headline wraps awkwardly or clips.
      - PASS while project section has a lone/unbalanced orphan card.
      - PASS while small dark-area labels remain low-contrast.
      - PASS with unresolved reference_drift_classification defect.
    warnings:
      - Lower sections remain visually generic compared with hero.
      - Blog/footer contrast improved only in one theme.
  required_evidence:
    - Changed files list and diff stat.
    - npm run lint.
    - npm run build.
    - Browser console check for /ko and /en.
    - Screenshots for /ko and /en at desktop, tablet, and mobile widths.
    - Comparison/critic note with reference_drift_classification.
  reference_drift_classification:
    - Current hero/reference direction: intentional baseline to preserve.
    - Prior project section sparse/orphan layout: defect to fix.
    - Prior weak small gray text: defect to fix.
    - KO-only visual check: defect to fix by KO/EN evidence.
  role_split:
    builder: Core direct implementation in current homepage branch, excluding .omx/.claude runtime residue.
    verifier: Core browser/build/visual QA with screenshot evidence and final PASS/CONDITIONAL/FAIL.
  artifact_evidence:
    required:
      - docs/reports/2026-05-06-homepage-visual-polish-harness.md
      - screenshot/reference artifacts under /tmp or docs/reports evidence paths
      - command:npm run lint
      - command:npm run build
      - browser console status for /ko and /en
  verdict:
    allowed_values: [PASS, CONDITIONAL, FAIL]
    pass_rule: All hard-fail items cleared, lint/build pass, screenshots and console evidence exist for KO/EN responsive states.
    escalation_rule: If visual QA exposes unresolved defect, patch and rerun targeted QA before commit.
  update_rule:
    when_gap_found: Patch homepage components and, if the harness itself leaks, update the durable harness policy/template before continuing.
```

## Verification log

Pending until implementation and QA complete.
