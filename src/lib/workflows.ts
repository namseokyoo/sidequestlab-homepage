export interface WorkflowDefinition {
  id: string;
  chart: {
    ko: string;
    en: string;
  };
}

export const workflows: WorkflowDefinition[] = [
  {
    id: 'project_lifecycle',
    chart: {
      ko: `graph LR
  PRD["PRD 작성"] --> APPROVE["회장님 승인"]
  APPROVE --> DEV["개발"]
  DEV --> QA["QA 검증"]
  QA -->|통과| DEPLOY["배포"]
  QA -->|반려| DEV
  DEPLOY --> VERIFY["배포 후 검증"]
  VERIFY --> RETRO["회고 & 기록"]

  style PRD fill:#3b82f6,stroke:#2563eb,color:#fff
  style APPROVE fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DEV fill:#10b981,stroke:#059669,color:#fff
  style QA fill:#f59e0b,stroke:#d97706,color:#fff
  style DEPLOY fill:#ef4444,stroke:#dc2626,color:#fff
  style VERIFY fill:#06b6d4,stroke:#0891b2,color:#fff
  style RETRO fill:#6366f1,stroke:#4f46e5,color:#fff`,
      en: `graph LR
  PRD["Write PRD"] --> APPROVE["Chairman Approval"]
  APPROVE --> DEV["Development"]
  DEV --> QA["QA Verification"]
  QA -->|Pass| DEPLOY["Deploy"]
  QA -->|Reject| DEV
  DEPLOY --> VERIFY["Post-deploy Verify"]
  VERIFY --> RETRO["Retrospective & Record"]

  style PRD fill:#3b82f6,stroke:#2563eb,color:#fff
  style APPROVE fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DEV fill:#10b981,stroke:#059669,color:#fff
  style QA fill:#f59e0b,stroke:#d97706,color:#fff
  style DEPLOY fill:#ef4444,stroke:#dc2626,color:#fff
  style VERIFY fill:#06b6d4,stroke:#0891b2,color:#fff
  style RETRO fill:#6366f1,stroke:#4f46e5,color:#fff`,
    },
  },
  {
    id: 'tech_review',
    chart: {
      ko: `graph TD
  CHECK["1. 회사 적합성 사전 체크"] --> REVIEW["2. 기술 문서 검토 & 요약"]
  REVIEW --> STRATEGY["3. 도입 전략 초안"]
  STRATEGY --> ADVISOR["4. Board Advisor 크로스체크"]
  ADVISOR -->|적합| FINAL["5. 재검토 및 최종 판단"]
  ADVISOR -->|부적합| BACKLOG["BACKLOG에 향후 참조 등록"]
  FINAL --> RECORD["6. DECISIONS.md 기록"]

  style CHECK fill:#3b82f6,stroke:#2563eb,color:#fff
  style REVIEW fill:#10b981,stroke:#059669,color:#fff
  style STRATEGY fill:#f59e0b,stroke:#d97706,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style FINAL fill:#06b6d4,stroke:#0891b2,color:#fff
  style RECORD fill:#6366f1,stroke:#4f46e5,color:#fff
  style BACKLOG fill:#9ca3af,stroke:#6b7280,color:#fff`,
      en: `graph TD
  CHECK["1. Company Fit Pre-check"] --> REVIEW["2. Tech Doc Review & Summary"]
  REVIEW --> STRATEGY["3. Adoption Strategy Draft"]
  STRATEGY --> ADVISOR["4. Board Advisor Cross-check"]
  ADVISOR -->|Suitable| FINAL["5. Re-review & Final Decision"]
  ADVISOR -->|Not Suitable| BACKLOG["Register in BACKLOG for Future Ref"]
  FINAL --> RECORD["6. Record in DECISIONS.md"]

  style CHECK fill:#3b82f6,stroke:#2563eb,color:#fff
  style REVIEW fill:#10b981,stroke:#059669,color:#fff
  style STRATEGY fill:#f59e0b,stroke:#d97706,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style FINAL fill:#06b6d4,stroke:#0891b2,color:#fff
  style RECORD fill:#6366f1,stroke:#4f46e5,color:#fff
  style BACKLOG fill:#9ca3af,stroke:#6b7280,color:#fff`,
    },
  },
  {
    id: 'org_structure',
    chart: {
      ko: `graph TD
  OWNER["회장님 (NAMSEOK)"] --> CEO["노이만 (CEO Agent)"]
  CEO --> ADVISOR["오펜하이머 (Board Advisor)"]
  CEO --> DEV["튜링 (Fullstack Dev)"]
  CEO --> QA["해밀턴 (QA Engineer)"]
  CEO --> DEVOPS["토발즈 (DevOps)"]
  CEO --> HISTORIAN["헤로도토스 (Historian)"]
  CEO --> CONTENT["세이건 (Content Writer)"]
  CEO --> GROWTH["페르미 (Growth Marketer)"]

  style OWNER fill:#1e293b,stroke:#0f172a,color:#fff
  style CEO fill:#3b82f6,stroke:#2563eb,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DEV fill:#10b981,stroke:#059669,color:#fff
  style QA fill:#f59e0b,stroke:#d97706,color:#fff
  style DEVOPS fill:#ef4444,stroke:#dc2626,color:#fff
  style HISTORIAN fill:#6366f1,stroke:#4f46e5,color:#fff
  style CONTENT fill:#06b6d4,stroke:#0891b2,color:#fff
  style GROWTH fill:#ec4899,stroke:#db2777,color:#fff`,
      en: `graph TD
  OWNER["Chairman (NAMSEOK)"] --> CEO["Neumann (CEO Agent)"]
  CEO --> ADVISOR["Oppenheimer (Board Advisor)"]
  CEO --> DEV["Turing (Fullstack Dev)"]
  CEO --> QA["Hamilton (QA Engineer)"]
  CEO --> DEVOPS["Torvalds (DevOps)"]
  CEO --> HISTORIAN["Herodotus (Historian)"]
  CEO --> CONTENT["Sagan (Content Writer)"]
  CEO --> GROWTH["Fermi (Growth Marketer)"]

  style OWNER fill:#1e293b,stroke:#0f172a,color:#fff
  style CEO fill:#3b82f6,stroke:#2563eb,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DEV fill:#10b981,stroke:#059669,color:#fff
  style QA fill:#f59e0b,stroke:#d97706,color:#fff
  style DEVOPS fill:#ef4444,stroke:#dc2626,color:#fff
  style HISTORIAN fill:#6366f1,stroke:#4f46e5,color:#fff
  style CONTENT fill:#06b6d4,stroke:#0891b2,color:#fff
  style GROWTH fill:#ec4899,stroke:#db2777,color:#fff`,
    },
  },
  {
    id: 'decision_process',
    chart: {
      ko: `graph LR
  ISSUE["이슈 발생"] --> CEO["CEO 분석"]
  CEO --> ADVISOR["Board Advisor 검토"]
  ADVISOR -->|피드백| CEO
  CEO --> DECISION["최종 의사결정"]
  DECISION --> RECORD["DECISIONS.md 기록"]
  RECORD --> HISTORY["HISTORY.md 반영"]

  style ISSUE fill:#ef4444,stroke:#dc2626,color:#fff
  style CEO fill:#3b82f6,stroke:#2563eb,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DECISION fill:#10b981,stroke:#059669,color:#fff
  style RECORD fill:#f59e0b,stroke:#d97706,color:#fff
  style HISTORY fill:#6366f1,stroke:#4f46e5,color:#fff`,
      en: `graph LR
  ISSUE["Issue Raised"] --> CEO["CEO Analysis"]
  CEO --> ADVISOR["Board Advisor Review"]
  ADVISOR -->|Feedback| CEO
  CEO --> DECISION["Final Decision"]
  DECISION --> RECORD["Record in DECISIONS.md"]
  RECORD --> HISTORY["Reflect in HISTORY.md"]

  style ISSUE fill:#ef4444,stroke:#dc2626,color:#fff
  style CEO fill:#3b82f6,stroke:#2563eb,color:#fff
  style ADVISOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
  style DECISION fill:#10b981,stroke:#059669,color:#fff
  style RECORD fill:#f59e0b,stroke:#d97706,color:#fff
  style HISTORY fill:#6366f1,stroke:#4f46e5,color:#fff`,
    },
  },
];
