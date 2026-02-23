// =============================================================================
// flowData.ts - 4개 워크플로우의 노드/엣지 데이터 정의
// 다국어(ko/en) 지원, WorkflowNodeData / WorkflowEdgeData 인터페이스 준수
// =============================================================================

import { type Node, type Edge } from '@xyflow/react';

type Locale = 'ko' | 'en';

// Helper: 다국어 텍스트 선택
function t(locale: Locale, ko: string, en: string): string {
  return locale === 'ko' ? ko : en;
}

// =============================================================================
// 1. 프로젝트 라이프사이클 (Project Lifecycle)
// =============================================================================

export function getProjectLifecycleNodes(locale: Locale): Node[] {
  return [
    // Row 0: Start
    {
      id: 'pl-start',
      type: 'workflow',
      position: { x: 400, y: 0 },
      data: {
        label: t(locale, '프로젝트 시작', 'Project Start'),
        role: 'ceo',
        nodeType: 'start',
      },
    },
    // Row 1: PRD
    {
      id: 'pl-prd',
      type: 'workflow',
      position: { x: 360, y: 110 },
      data: {
        label: t(locale, 'PRD 작성', 'Write PRD'),
        description: t(locale, 'Product Requirements Document', 'Product Requirements Document'),
        role: 'dev',
        nodeType: 'process',
        rules: [
          t(locale, '모든 프로젝트는 PRD 승인 후 시작', 'All projects start after PRD approval'),
        ],
      },
    },
    // Row 2: Chairman approval gate
    {
      id: 'pl-approval',
      type: 'workflow',
      position: { x: 370, y: 230 },
      data: {
        label: t(locale, '회장님 승인', 'Chairman Approval'),
        description: t(locale, '최종 승인 게이트', 'Final approval gate'),
        role: 'chairman',
        nodeType: 'gate',
        rules: [
          t(locale, 'PRD 검토 후 승인/반려', 'Approve/Reject after PRD review'),
        ],
      },
    },
    // Row 3: Grade classification (decision)
    {
      id: 'pl-grade',
      type: 'workflow',
      position: { x: 365, y: 370 },
      data: {
        label: t(locale, '등급 분류', 'Grade Classification'),
        description: t(locale, 'S/A/B/L 등급', 'S/A/B/L Grade'),
        role: 'ceo',
        nodeType: 'decision',
      },
    },
    // Row 4: 4 branches (S, A, B, L)
    {
      id: 'pl-grade-s',
      type: 'workflow',
      position: { x: 0, y: 540 },
      data: {
        label: t(locale, 'S등급: OMX 정밀설계', 'S-Grade: OMX Precision'),
        description: t(locale, '복잡도 최상위 프로젝트', 'Highest complexity project'),
        role: 'dev',
        nodeType: 'process',
        examples: [
          t(locale, 'BookSalon: Supabase 마이그레이션', 'BookSalon: Supabase Migration'),
        ],
      },
    },
    {
      id: 'pl-grade-s-verify',
      type: 'workflow',
      position: { x: 0, y: 650 },
      data: {
        label: t(locale, '의사코드 검증', 'Pseudocode Verification'),
        description: t(locale, 'QA가 설계 검증', 'QA verifies design'),
        role: 'qa',
        nodeType: 'process',
      },
    },
    {
      id: 'pl-grade-a',
      type: 'workflow',
      position: { x: 250, y: 540 },
      data: {
        label: t(locale, 'A등급: Codex Full-Auto', 'A-Grade: Codex Full-Auto'),
        description: t(locale, '자동화 가능 프로젝트', 'Automatable project'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    {
      id: 'pl-grade-b',
      type: 'workflow',
      position: { x: 520, y: 540 },
      data: {
        label: t(locale, 'B등급: Codex 직접', 'B-Grade: Direct Codex'),
        description: t(locale, '표준 개발 프로세스', 'Standard dev process'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    {
      id: 'pl-grade-l',
      type: 'workflow',
      position: { x: 770, y: 540 },
      data: {
        label: t(locale, 'L등급: OMX 팀 마스터플랜', 'L-Grade: OMX Team Masterplan'),
        description: t(locale, '대규모 장기 프로젝트', 'Large-scale long-term project'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    // Row 5: Dev local test (merge point)
    {
      id: 'pl-dev-test',
      type: 'workflow',
      position: { x: 360, y: 780 },
      data: {
        label: t(locale, 'Dev 로컬 테스트', 'Dev Local Test'),
        description: t(locale, '개발자 자체 기능 검증', 'Developer self-verification'),
        role: 'dev',
        nodeType: 'process',
        rules: [
          t(locale, '로컬 테스트 필수', 'Local testing mandatory'),
        ],
      },
    },
    // Row 6: QA E2E
    {
      id: 'pl-qa-e2e',
      type: 'workflow',
      position: { x: 360, y: 890 },
      data: {
        label: t(locale, 'QA E2E 테스트', 'QA E2E Test'),
        description: t(locale, 'Playwright 기반 E2E', 'Playwright-based E2E'),
        role: 'qa',
        nodeType: 'process',
      },
    },
    // Row 7: QA UI
    {
      id: 'pl-qa-ui',
      type: 'workflow',
      position: { x: 360, y: 1000 },
      data: {
        label: t(locale, 'QA UI 테스트', 'QA UI Test'),
        description: t(locale, '시각적 검증, 반응형 테스트', 'Visual verification, responsive test'),
        role: 'qa',
        nodeType: 'process',
      },
    },
    // Row 8: QA Performance
    {
      id: 'pl-qa-perf',
      type: 'workflow',
      position: { x: 360, y: 1110 },
      data: {
        label: t(locale, 'QA 성능 테스트', 'QA Performance Test'),
        description: t(locale, 'Lighthouse, Core Web Vitals', 'Lighthouse, Core Web Vitals'),
        role: 'qa',
        nodeType: 'process',
      },
    },
    // Row 9: QA Result (decision)
    {
      id: 'pl-qa-result',
      type: 'workflow',
      position: { x: 365, y: 1240 },
      data: {
        label: t(locale, 'QA 결과', 'QA Result'),
        description: t(locale, 'Pass / Fail', 'Pass / Fail'),
        role: 'qa',
        nodeType: 'decision',
        rules: [
          t(locale, 'QA 검증 없이 프로덕션 배포 금지', 'No production deployment without QA'),
        ],
      },
    },
    // Row 10: DevOps Deploy
    {
      id: 'pl-deploy',
      type: 'workflow',
      position: { x: 360, y: 1420 },
      data: {
        label: t(locale, 'DevOps 배포', 'DevOps Deploy'),
        description: t(locale, 'Vercel / 프로덕션 배포', 'Vercel / Production deploy'),
        role: 'devops',
        nodeType: 'process',
        rules: [
          t(locale, 'QA 승인 후에만 배포 가능', 'Deploy only after QA approval'),
        ],
      },
    },
    // Row 11: URL Verification
    {
      id: 'pl-url-verify',
      type: 'workflow',
      position: { x: 360, y: 1530 },
      data: {
        label: t(locale, 'URL 검증', 'URL Verification'),
        description: t(locale, 'PROJECTS.md가 SSOT', 'PROJECTS.md is SSOT'),
        role: 'devops',
        nodeType: 'gate',
        rules: [
          t(locale, 'URL 추정 금지, PROJECTS.md 대조 필수', 'No URL guessing, must check PROJECTS.md'),
        ],
      },
    },
    // Row 12: QA post-deploy
    {
      id: 'pl-qa-post',
      type: 'workflow',
      position: { x: 360, y: 1650 },
      data: {
        label: t(locale, 'QA 배포후 검증', 'QA Post-Deploy Verify'),
        description: t(locale, '실환경 최종 검증', 'Production final verification'),
        role: 'qa',
        nodeType: 'process',
        rules: [
          t(locale, '배포 후 검증 필수', 'Post-deployment verification required'),
        ],
      },
    },
    // Row 13: CEO Report
    {
      id: 'pl-ceo-report',
      type: 'workflow',
      position: { x: 360, y: 1760 },
      data: {
        label: t(locale, 'CEO 보고', 'CEO Report'),
        description: t(locale, '프로젝트 완료 보고', 'Project completion report'),
        role: 'ceo',
        nodeType: 'process',
      },
    },
    // Row 14: Historian sync
    {
      id: 'pl-historian',
      type: 'workflow',
      position: { x: 360, y: 1870 },
      data: {
        label: t(locale, '문서 동기화', 'Document Sync'),
        description: t(locale, 'DECISIONS/HISTORY/PROJECTS.md 갱신', 'Update DECISIONS/HISTORY/PROJECTS.md'),
        role: 'historian',
        nodeType: 'document',
      },
    },
    // Row 15: End
    {
      id: 'pl-end',
      type: 'workflow',
      position: { x: 400, y: 1980 },
      data: {
        label: t(locale, '완료', 'Complete'),
        role: 'ceo',
        nodeType: 'end',
      },
    },
  ];
}

export function getProjectLifecycleEdges(locale: Locale): Edge[] {
  return [
    // Main flow
    { id: 'pl-e-start-prd', source: 'pl-start', target: 'pl-prd', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-prd-approval', source: 'pl-prd', target: 'pl-approval', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-approval-grade', source: 'pl-approval', target: 'pl-grade', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'success', label: t(locale, '승인', 'Approved') } },
    // Grade branches
    { id: 'pl-e-grade-s', source: 'pl-grade', target: 'pl-grade-s', type: 'workflow', sourceHandle: 'left', data: { edgeType: 'conditional', label: 'S' } },
    { id: 'pl-e-grade-a', source: 'pl-grade', target: 'pl-grade-a', type: 'workflow', sourceHandle: 'left', data: { edgeType: 'conditional', label: 'A' } },
    { id: 'pl-e-grade-b', source: 'pl-grade', target: 'pl-grade-b', type: 'workflow', sourceHandle: 'right', data: { edgeType: 'conditional', label: 'B' } },
    { id: 'pl-e-grade-l', source: 'pl-grade', target: 'pl-grade-l', type: 'workflow', sourceHandle: 'right', data: { edgeType: 'conditional', label: 'L' } },
    // S-grade sub-flow
    { id: 'pl-e-s-verify', source: 'pl-grade-s', target: 'pl-grade-s-verify', type: 'workflow', data: { edgeType: 'default' } },
    // All branches merge to dev test
    { id: 'pl-e-s-merge', source: 'pl-grade-s-verify', target: 'pl-dev-test', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-a-merge', source: 'pl-grade-a', target: 'pl-dev-test', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-b-merge', source: 'pl-grade-b', target: 'pl-dev-test', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-l-merge', source: 'pl-grade-l', target: 'pl-dev-test', type: 'workflow', data: { edgeType: 'default' } },
    // QA pipeline
    { id: 'pl-e-dev-qa1', source: 'pl-dev-test', target: 'pl-qa-e2e', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-qa1-qa2', source: 'pl-qa-e2e', target: 'pl-qa-ui', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-qa2-qa3', source: 'pl-qa-ui', target: 'pl-qa-perf', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-qa3-result', source: 'pl-qa-perf', target: 'pl-qa-result', type: 'workflow', data: { edgeType: 'default' } },
    // QA result branches
    { id: 'pl-e-result-pass', source: 'pl-qa-result', target: 'pl-deploy', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'success', label: 'Pass' } },
    { id: 'pl-e-result-fail', source: 'pl-qa-result', target: 'pl-dev-test', type: 'workflow', sourceHandle: 'left', data: { edgeType: 'fail', label: 'Fail' } },
    // Deploy flow
    { id: 'pl-e-deploy-url', source: 'pl-deploy', target: 'pl-url-verify', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-url-qapost', source: 'pl-url-verify', target: 'pl-qa-post', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'default' } },
    { id: 'pl-e-qapost-ceo', source: 'pl-qa-post', target: 'pl-ceo-report', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-ceo-historian', source: 'pl-ceo-report', target: 'pl-historian', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'pl-e-historian-end', source: 'pl-historian', target: 'pl-end', type: 'workflow', data: { edgeType: 'default' } },
  ];
}

// =============================================================================
// 2. 의사결정 프로세스 (Decision Process)
// =============================================================================

export function getDecisionProcessNodes(locale: Locale): Node[] {
  return [
    {
      id: 'dp-start',
      type: 'workflow',
      position: { x: 350, y: 0 },
      data: {
        label: t(locale, '이슈/사고 발생', 'Issue/Incident'),
        role: 'ceo',
        nodeType: 'start',
      },
    },
    {
      id: 'dp-ceo-analyze',
      type: 'workflow',
      position: { x: 310, y: 110 },
      data: {
        label: t(locale, 'CEO 분석', 'CEO Analysis'),
        description: t(locale, '이슈 분석 및 해결 방안 검토', 'Issue analysis & solution review'),
        role: 'ceo',
        nodeType: 'process',
        rules: [
          t(locale, 'Edit/Write 도구 사용 금지', 'Edit/Write tool usage prohibited'),
          t(locale, 'Read/Glob/Grep만 허용', 'Only Read/Glob/Grep allowed'),
          t(locale, 'Task 도구로 위임만 가능', 'Only delegation via Task tool'),
        ],
      },
    },
    {
      id: 'dp-advisor-check',
      type: 'workflow',
      position: { x: 310, y: 240 },
      data: {
        label: t(locale, 'Board Advisor 크로스체크', 'Board Advisor Cross-Check'),
        description: t(locale, '리스크 평가 및 대안 제시', 'Risk assessment & alternatives'),
        role: 'advisor',
        nodeType: 'process',
        rules: [
          t(locale, 'Board Advisor 크로스체크 필수', 'Board Advisor cross-check mandatory'),
        ],
        examples: [
          t(locale, 'DEC-079: 프롬프트 캐싱 검토 시 회사 적합성 미확인 방지', 'DEC-079: Prevented deploying prompt caching without company fit check'),
        ],
      },
    },
    {
      id: 'dp-feedback',
      type: 'workflow',
      position: { x: 325, y: 380 },
      data: {
        label: t(locale, '피드백', 'Feedback'),
        description: t(locale, '승인 / 수정 요청', 'Approve / Request changes'),
        role: 'advisor',
        nodeType: 'decision',
      },
    },
    {
      id: 'dp-final-decision',
      type: 'workflow',
      position: { x: 310, y: 560 },
      data: {
        label: t(locale, '최종 의사결정', 'Final Decision'),
        description: t(locale, 'CEO 최종 판단', 'CEO final judgment'),
        role: 'ceo',
        nodeType: 'process',
      },
    },
    {
      id: 'dp-dec-number',
      type: 'workflow',
      position: { x: 310, y: 670 },
      data: {
        label: t(locale, 'DEC 번호 부여', 'Assign DEC Number'),
        description: t(locale, '의사결정 고유 번호 부여', 'Assign unique decision number'),
        role: 'ceo',
        nodeType: 'document',
        examples: [
          'DEC-082, DEC-083, DEC-084...',
        ],
      },
    },
    // Document sync sub-flow
    {
      id: 'dp-decisions-md',
      type: 'workflow',
      position: { x: 100, y: 800 },
      data: {
        label: 'DECISIONS.md',
        description: t(locale, '의사결정 로그 기록', 'Decision log recording'),
        role: 'historian',
        nodeType: 'document',
      },
    },
    {
      id: 'dp-history-md',
      type: 'workflow',
      position: { x: 340, y: 800 },
      data: {
        label: 'HISTORY.md',
        description: t(locale, '회사 연혁 동기화', 'Company history sync'),
        role: 'historian',
        nodeType: 'document',
      },
    },
    {
      id: 'dp-skill-patch',
      type: 'workflow',
      position: { x: 570, y: 800 },
      data: {
        label: t(locale, 'SKILL.md 패치', 'SKILL.md Patch'),
        description: t(locale, '관련 스킬 문서 업데이트', 'Update related skill docs'),
        role: 'dev',
        nodeType: 'document',
      },
    },
    // Convergence
    {
      id: 'dp-rule-enforce',
      type: 'workflow',
      position: { x: 310, y: 940 },
      data: {
        label: t(locale, '규칙 강화', 'Rule Enforcement'),
        description: t(locale, '사고→규칙화 폐쇄 루프 완료', 'Incident-to-rule closure loop done'),
        role: 'ceo',
        nodeType: 'process',
        examples: [
          t(locale, 'DEC-028: QA 없이 배포 → 프로덕션 장애 → QA 필수 규칙화', 'DEC-028: Deploy without QA → Production incident → QA mandatory rule'),
        ],
      },
    },
    {
      id: 'dp-end',
      type: 'workflow',
      position: { x: 350, y: 1060 },
      data: {
        label: t(locale, '종료', 'End'),
        role: 'ceo',
        nodeType: 'end',
      },
    },
  ];
}

export function getDecisionProcessEdges(locale: Locale): Edge[] {
  return [
    { id: 'dp-e-start-analyze', source: 'dp-start', target: 'dp-ceo-analyze', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-analyze-advisor', source: 'dp-ceo-analyze', target: 'dp-advisor-check', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-advisor-feedback', source: 'dp-advisor-check', target: 'dp-feedback', type: 'workflow', data: { edgeType: 'default' } },
    // Feedback branches
    { id: 'dp-e-feedback-approve', source: 'dp-feedback', target: 'dp-final-decision', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'success', label: t(locale, '승인', 'Approved') } },
    { id: 'dp-e-feedback-revise', source: 'dp-feedback', target: 'dp-ceo-analyze', type: 'workflow', sourceHandle: 'left', data: { edgeType: 'fail', label: t(locale, '수정 요청', 'Revision') } },
    // Final decision flow
    { id: 'dp-e-decision-dec', source: 'dp-final-decision', target: 'dp-dec-number', type: 'workflow', data: { edgeType: 'default' } },
    // DEC number to documents (parallel)
    { id: 'dp-e-dec-decisions', source: 'dp-dec-number', target: 'dp-decisions-md', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-dec-history', source: 'dp-dec-number', target: 'dp-history-md', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-dec-skill', source: 'dp-dec-number', target: 'dp-skill-patch', type: 'workflow', data: { edgeType: 'default' } },
    // Documents to rule enforcement
    { id: 'dp-e-decisions-rule', source: 'dp-decisions-md', target: 'dp-rule-enforce', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-history-rule', source: 'dp-history-md', target: 'dp-rule-enforce', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'dp-e-skill-rule', source: 'dp-skill-patch', target: 'dp-rule-enforce', type: 'workflow', data: { edgeType: 'default' } },
    // End
    { id: 'dp-e-rule-end', source: 'dp-rule-enforce', target: 'dp-end', type: 'workflow', data: { edgeType: 'default' } },
  ];
}

// =============================================================================
// 3. 품질 게이트 시스템 (Quality Gate System)
// =============================================================================

export function getQualityGateNodes(locale: Locale): Node[] {
  return [
    {
      id: 'qg-start',
      type: 'workflow',
      position: { x: 350, y: 0 },
      data: {
        label: t(locale, '코드 입력', 'Code Input'),
        role: 'dev',
        nodeType: 'start',
      },
    },
    // 8 gates - vertical layout
    {
      id: 'qg-gate1',
      type: 'workflow',
      position: { x: 320, y: 110 },
      data: {
        label: t(locale, '1. Syntax 검증', '1. Syntax Check'),
        description: t(locale, '구문 오류 검사', 'Syntax error detection'),
        role: 'dev',
        nodeType: 'gate',
      },
    },
    {
      id: 'qg-gate2',
      type: 'workflow',
      position: { x: 320, y: 220 },
      data: {
        label: t(locale, '2. Type 검증', '2. Type Check'),
        description: t(locale, 'TypeScript 타입 검사', 'TypeScript type check'),
        role: 'dev',
        nodeType: 'gate',
      },
    },
    {
      id: 'qg-gate3',
      type: 'workflow',
      position: { x: 320, y: 330 },
      data: {
        label: t(locale, '3. Lint 검증', '3. Lint Check'),
        description: t(locale, 'ESLint 규칙 준수', 'ESLint rule compliance'),
        role: 'dev',
        nodeType: 'gate',
      },
    },
    {
      id: 'qg-gate4',
      type: 'workflow',
      position: { x: 320, y: 440 },
      data: {
        label: t(locale, '4. Security 검증', '4. Security Check'),
        description: t(locale, '보안 취약점 스캔', 'Security vulnerability scan'),
        role: 'qa',
        nodeType: 'gate',
        rules: [
          t(locale, 'OWASP 준수', 'OWASP compliance'),
        ],
      },
    },
    {
      id: 'qg-gate5',
      type: 'workflow',
      position: { x: 320, y: 550 },
      data: {
        label: t(locale, '5. Test 검증', '5. Test Check'),
        description: t(locale, '단위/통합 테스트', 'Unit/Integration tests'),
        role: 'qa',
        nodeType: 'gate',
        rules: [
          t(locale, '커버리지 80% 이상 필수', 'Coverage 80%+ required'),
        ],
      },
    },
    {
      id: 'qg-gate6',
      type: 'workflow',
      position: { x: 320, y: 660 },
      data: {
        label: t(locale, '6. Performance 검증', '6. Performance Check'),
        description: t(locale, '성능 벤치마크', 'Performance benchmark'),
        role: 'qa',
        nodeType: 'gate',
      },
    },
    {
      id: 'qg-gate7',
      type: 'workflow',
      position: { x: 320, y: 770 },
      data: {
        label: t(locale, '7. Documentation 검증', '7. Documentation Check'),
        description: t(locale, '문서 완성도 확인', 'Documentation completeness'),
        role: 'historian',
        nodeType: 'gate',
      },
    },
    {
      id: 'qg-gate8',
      type: 'workflow',
      position: { x: 320, y: 880 },
      data: {
        label: t(locale, '8. Integration 검증', '8. Integration Check'),
        description: t(locale, '통합 호환성 검증', 'Integration compatibility'),
        role: 'devops',
        nodeType: 'gate',
      },
    },
    // 3-tier verification
    {
      id: 'qg-dev-verify',
      type: 'workflow',
      position: { x: 130, y: 1020 },
      data: {
        label: t(locale, 'Dev 기능 검증', 'Dev Functional Verify'),
        description: t(locale, '개발자 기능 테스트', 'Developer functional test'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    {
      id: 'qg-qa-verify',
      type: 'workflow',
      position: { x: 350, y: 1020 },
      data: {
        label: t(locale, 'QA 품질 검증', 'QA Quality Verify'),
        description: t(locale, '품질 보증 테스트', 'Quality assurance test'),
        role: 'qa',
        nodeType: 'process',
        rules: [
          t(locale, '3중 검증: Dev → QA → DevOps', '3-tier: Dev → QA → DevOps'),
        ],
      },
    },
    {
      id: 'qg-devops-verify',
      type: 'workflow',
      position: { x: 570, y: 1020 },
      data: {
        label: t(locale, 'DevOps 배포 검증', 'DevOps Deploy Verify'),
        description: t(locale, '배포 환경 검증', 'Deployment environment verify'),
        role: 'devops',
        nodeType: 'process',
      },
    },
    // End
    {
      id: 'qg-end',
      type: 'workflow',
      position: { x: 350, y: 1160 },
      data: {
        label: t(locale, '검증 완료', 'Verification Complete'),
        role: 'qa',
        nodeType: 'end',
      },
    },
  ];
}

export function getQualityGateEdges(locale: Locale): Edge[] {
  const gates = ['qg-gate1', 'qg-gate2', 'qg-gate3', 'qg-gate4', 'qg-gate5', 'qg-gate6', 'qg-gate7', 'qg-gate8'];
  const edges: Edge[] = [];

  // Start to first gate
  edges.push({
    id: 'qg-e-start-g1',
    source: 'qg-start',
    target: 'qg-gate1',
    type: 'workflow',
    data: { edgeType: 'default' },
  });

  // Chain gates
  for (let i = 0; i < gates.length - 1; i++) {
    edges.push({
      id: `qg-e-g${i + 1}-g${i + 2}`,
      source: gates[i],
      target: gates[i + 1],
      type: 'workflow',
      sourceHandle: 'bottom',
      data: { edgeType: 'success', label: 'Pass' },
    });
  }

  // Fail edges: each gate loops back to itself (rollback concept)
  for (let i = 0; i < gates.length; i++) {
    edges.push({
      id: `qg-e-g${i + 1}-fail`,
      source: gates[i],
      target: gates[i],
      type: 'workflow',
      sourceHandle: 'right',
      data: { edgeType: 'fail', label: t(locale, '실패→수정', 'Fail→Fix') },
    });
  }

  // Last gate to 3-tier verification
  edges.push({
    id: 'qg-e-g8-dev',
    source: 'qg-gate8',
    target: 'qg-dev-verify',
    type: 'workflow',
    sourceHandle: 'bottom',
    data: { edgeType: 'success', label: 'Pass' },
  });
  edges.push({
    id: 'qg-e-g8-qa',
    source: 'qg-gate8',
    target: 'qg-qa-verify',
    type: 'workflow',
    sourceHandle: 'bottom',
    data: { edgeType: 'success' },
  });
  edges.push({
    id: 'qg-e-g8-devops',
    source: 'qg-gate8',
    target: 'qg-devops-verify',
    type: 'workflow',
    sourceHandle: 'bottom',
    data: { edgeType: 'success' },
  });

  // 3-tier to end
  edges.push({
    id: 'qg-e-dev-end',
    source: 'qg-dev-verify',
    target: 'qg-end',
    type: 'workflow',
    data: { edgeType: 'default' },
  });
  edges.push({
    id: 'qg-e-qa-end',
    source: 'qg-qa-verify',
    target: 'qg-end',
    type: 'workflow',
    data: { edgeType: 'default' },
  });
  edges.push({
    id: 'qg-e-devops-end',
    source: 'qg-devops-verify',
    target: 'qg-end',
    type: 'workflow',
    data: { edgeType: 'default' },
  });

  return edges;
}

// =============================================================================
// 4. 신기술 검토 프로토콜 (Tech Review Protocol)
// =============================================================================

export function getTechReviewNodes(locale: Locale): Node[] {
  return [
    {
      id: 'tr-start',
      type: 'workflow',
      position: { x: 350, y: 0 },
      data: {
        label: t(locale, '새 기술 발견', 'New Tech Discovered'),
        role: 'ceo',
        nodeType: 'start',
      },
    },
    {
      id: 'tr-step1',
      type: 'workflow',
      position: { x: 300, y: 120 },
      data: {
        label: t(locale, 'Step 1: 회사 적합성 사전 체크', 'Step 1: Company Fit Pre-Check'),
        description: t(locale, '가장 먼저! 회사에 필요한 기술인가?', 'First! Is this tech needed?'),
        role: 'ceo',
        nodeType: 'gate',
        rules: [
          t(locale, '회사 적합성 체크가 가장 먼저', 'Company fit check comes first'),
          t(locale, '적합성 체크 없이 전략 수립 금지', 'No strategy without fit check'),
        ],
        examples: [
          t(locale, 'DEC-079: 프롬프트 캐싱 → 사전 체크에서 현재 불필요 판단', 'DEC-079: Prompt caching → Pre-check found currently unnecessary'),
        ],
      },
    },
    {
      id: 'tr-step2',
      type: 'workflow',
      position: { x: 310, y: 260 },
      data: {
        label: t(locale, 'Step 2: 기술 문서 검토', 'Step 2: Technical Doc Review'),
        description: t(locale, '공식 문서 분석 및 요약', 'Official docs analysis & summary'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    {
      id: 'tr-step3',
      type: 'workflow',
      position: { x: 310, y: 370 },
      data: {
        label: t(locale, 'Step 3: 도입 전략 초안', 'Step 3: Adoption Strategy Draft'),
        description: t(locale, '단계적 도입 계획 수립', 'Phased adoption planning'),
        role: 'ceo',
        nodeType: 'process',
      },
    },
    {
      id: 'tr-step4',
      type: 'workflow',
      position: { x: 310, y: 480 },
      data: {
        label: t(locale, 'Step 4: Board Advisor 크로스체크', 'Step 4: Board Advisor Cross-Check'),
        description: t(locale, '객관적 검증 및 리스크 평가', 'Objective verification & risk assessment'),
        role: 'advisor',
        nodeType: 'process',
        rules: [
          t(locale, 'Board Advisor 크로스체크 필수', 'Board Advisor cross-check mandatory'),
        ],
      },
    },
    {
      id: 'tr-judgment',
      type: 'workflow',
      position: { x: 325, y: 610 },
      data: {
        label: t(locale, '판단', 'Judgment'),
        description: t(locale, '적합 / 부적합 / 보류', 'Fit / Unfit / Hold'),
        role: 'advisor',
        nodeType: 'decision',
      },
    },
    // Unfit / Hold branch
    {
      id: 'tr-backlog',
      type: 'workflow',
      position: { x: 600, y: 620 },
      data: {
        label: t(locale, 'BACKLOG 등록', 'Add to BACKLOG'),
        description: t(locale, '향후 재검토 목록에 추가', 'Added to future review list'),
        role: 'historian',
        nodeType: 'document',
      },
    },
    {
      id: 'tr-end-reject',
      type: 'workflow',
      position: { x: 650, y: 760 },
      data: {
        label: t(locale, '종료 (보류/반려)', 'End (Hold/Reject)'),
        role: 'ceo',
        nodeType: 'end',
      },
    },
    // Fit branch
    {
      id: 'tr-step5',
      type: 'workflow',
      position: { x: 310, y: 780 },
      data: {
        label: t(locale, 'Step 5: 재검토 및 최종 판단', 'Step 5: Final Review & Decision'),
        description: t(locale, 'CEO 최종 판단', 'CEO final judgment'),
        role: 'ceo',
        nodeType: 'process',
      },
    },
    {
      id: 'tr-step6',
      type: 'workflow',
      position: { x: 310, y: 900 },
      data: {
        label: t(locale, 'Step 6: DEC 기록', 'Step 6: DEC Recording'),
        description: t(locale, 'DECISIONS.md에 기록', 'Record in DECISIONS.md'),
        role: 'historian',
        nodeType: 'document',
        rules: [
          t(locale, '검토 결과 DECISIONS.md 기록 필수', 'Review results must be recorded in DECISIONS.md'),
        ],
        examples: [
          t(locale, 'DEC-082: Excalidraw → 블로그 시각화 도구로 단계적 도입 결정', 'DEC-082: Excalidraw → Phased adoption as blog visualization tool'),
        ],
      },
    },
    {
      id: 'tr-implement',
      type: 'workflow',
      position: { x: 310, y: 1020 },
      data: {
        label: t(locale, '도입 실행', 'Implementation'),
        description: t(locale, '기술 도입 실행', 'Execute tech adoption'),
        role: 'dev',
        nodeType: 'process',
      },
    },
    {
      id: 'tr-end-success',
      type: 'workflow',
      position: { x: 350, y: 1140 },
      data: {
        label: t(locale, '완료', 'Complete'),
        role: 'dev',
        nodeType: 'end',
      },
    },
  ];
}

export function getTechReviewEdges(locale: Locale): Edge[] {
  return [
    { id: 'tr-e-start-s1', source: 'tr-start', target: 'tr-step1', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'tr-e-s1-s2', source: 'tr-step1', target: 'tr-step2', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'success', label: t(locale, '적합', 'Fit') } },
    { id: 'tr-e-s2-s3', source: 'tr-step2', target: 'tr-step3', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'tr-e-s3-s4', source: 'tr-step3', target: 'tr-step4', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'tr-e-s4-judgment', source: 'tr-step4', target: 'tr-judgment', type: 'workflow', data: { edgeType: 'default' } },
    // Judgment branches
    { id: 'tr-e-judgment-fit', source: 'tr-judgment', target: 'tr-step5', type: 'workflow', sourceHandle: 'bottom', data: { edgeType: 'success', label: t(locale, '적합', 'Fit') } },
    { id: 'tr-e-judgment-unfit', source: 'tr-judgment', target: 'tr-backlog', type: 'workflow', sourceHandle: 'right', data: { edgeType: 'fail', label: t(locale, '부적합', 'Unfit') } },
    { id: 'tr-e-judgment-hold', source: 'tr-judgment', target: 'tr-backlog', type: 'workflow', sourceHandle: 'right', data: { edgeType: 'conditional', label: t(locale, '보류', 'Hold') } },
    // Reject end
    { id: 'tr-e-backlog-end', source: 'tr-backlog', target: 'tr-end-reject', type: 'workflow', data: { edgeType: 'default' } },
    // Fit path continues
    { id: 'tr-e-s5-s6', source: 'tr-step5', target: 'tr-step6', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'tr-e-s6-impl', source: 'tr-step6', target: 'tr-implement', type: 'workflow', data: { edgeType: 'default' } },
    { id: 'tr-e-impl-end', source: 'tr-implement', target: 'tr-end-success', type: 'workflow', data: { edgeType: 'default' } },
    // Step 1 fail (not fit at pre-check)
    { id: 'tr-e-s1-backlog', source: 'tr-step1', target: 'tr-backlog', type: 'workflow', sourceHandle: 'right', data: { edgeType: 'fail', label: t(locale, '부적합', 'Unfit') } },
  ];
}
