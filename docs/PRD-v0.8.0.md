# PRD: SidequestLab Homepage v0.8.0
## 하네스 페이지 신설 & 콘텐츠 최신화

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| **버전** | v0.8.0 |
| **작성일** | 2026-03-11 |
| **작성자** | Company Historian (CEO 지시) |
| **상태** | Board Advisor 검토 완료 (Reviewed) |
| **관련 의사결정** | DEC-105 (하네스 v4.0), DEC-146 (하네스 v5.0 Sprint D), DEC-142 (ISCV 아카이브) |
| **승인자** | 회장님 (NAMSEOK) |

---

## 1. 프로젝트 개요

### 1.1 목적

- 하네스 엔지니어링(v4.0~v5.0) 완성에 따른 AI 에이전트 품질 보증 체계를 홈페이지 독립 페이지로 소개
- 3월 주요 이벤트(북살롱 v1.0.0, ISCV 아카이브 등) 미반영 항목 업데이트
- 프로젝트 데이터 현실화 (ISCV 아카이브, 북살롱 v1.0.0, Display Lab Phase 2-B)

**타깃 독자**: 기술 브랜딩 및 채용 포트폴리오 목적. 주요 독자: 기술 파트너, 개발자 커뮤니티, 채용 후보

### 1.2 배경

- **하네스 v4.0~v5.0 완성**: DEC-105(Custom Subagent Architecture), DEC-146(Sprint D 추적 기반 강화)으로 AI 에이전트 품질 보증 체계가 5개 버전에 걸쳐 성숙. 홈페이지에 독립 페이지로 소개할 시점 도달
- **3월 이벤트 미반영**: 북살롱 v1.0.0 출시(2026-03-04), 하네스 v4.0 완성(2026-03-07), ISCV 아카이브(2026-03-10), 하네스 v5.0 Sprint D 완료(2026-03-11) 등 주요 이벤트가 홈페이지에 미반영 상태
- **Board Advisor 크로스체크 결과**: 워크플로우 페이지 내 섹션 추가(A안) 대신 독립 페이지 분리 + teaser 연결(B안) 권고 → 회장님 승인 완료

### 1.3 기술 스택

기존 스택과 동일하게 유지:

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS 4 |
| 국제화 | next-intl |
| 런타임 | React 19 |
| 다이어그램 | CSS/SVG (WS-5 아키텍처 다이어그램 확정) |
| 다이어그램 (기존 워크플로우 페이지) | @xyflow/react (기존 워크플로우 페이지에서만 사용) |
| 애니메이션 | framer-motion |

### 1.4 배포

- **플랫폼**: Vercel
- **URL**: sidequestlab-homepage.vercel.app (기존 유지)

---

## 2. 워크스트림 상세

### WS-1: 프로젝트 데이터 최신화

**파일**: `src/lib/projects.ts`

| 프로젝트 | 변경 내용 |
|----------|----------|
| **ISCV (spectrum-visualizer)** | `featured: true` → `featured: false` 변경, 아카이브 상태 표시. DEC-142 반영 (영문 SEO 3주 0명, Display Lab에 자산 흡수 완료) |
| **북살롱 (booksalon)** | features 업데이트 — v1.0.0 출시 반영: 대댓글 시스템, React Router v7, OKLCH 디자인 시스템, "다정한 도서관" 브랜딩 |
| **Display Lab (displaylab)** | features 업데이트 — Phase 2-B 완료 반영: Color Gamut, Viewing Angle, Color Science Calculator, Spectrum Analyzer, Universal Converter, Panel Comparator, HDR Analyzer, CRI/TLCI/TM-30 (8개 모듈) |

---

### WS-2: 타임라인 3월 이벤트 추가

**파일**: `src/lib/timeline.ts`

| 날짜 | 이벤트 | 타입 |
|------|--------|------|
| 2026-03-04 | 북살롱 v1.0.0 정식 출시 | `project` |
| 2026-03-07 | 하네스 v4.0 Custom Subagent Architecture 완성 | `milestone` |
| 2026-03-10 | ISCV 아카이브 → Display Lab 자산 흡수 | `governance` |
| 2026-03-11 | 하네스 v5.0 Sprint D 완료 (추적 기반 강화) | `milestone` |

---

### WS-3: 로드맵 현실 반영

**파일**: `messages/ko.json`, `messages/en.json`

#### 단기 목표 변경

- **기존**: Q1 2026
- **변경**: Q2 2026

**단기 목표 항목:**
- 북살롱 E2E 테스트 자동화 (63개 시나리오)
- Display Lab Phase 2-C (디스플레이 DB, PDF 리포트)
- 하네스 v5.0 KPI 2회차 리뷰

#### 중기 목표 항목:
- 북살롱 커뮤니티 기능 강화
- Display Lab 글로벌 전문 도구 포지셔닝
- 프리미엄 기능 수익 모델 구축

---

### WS-4: 워크플로우 페이지 업데이트

**파일**: `messages/ko.json`, `messages/en.json`, `src/app/[locale]/workflow/WorkflowPageContent.tsx`

#### hero_stats 업데이트

| 항목 | 기존 | 변경 |
|------|------|------|
| 의사결정 수 | 84 | 146+ |
| 강제 규칙 | 재검수 후 반영 | - |

#### 하네스 Teaser 카드 추가

- **위치**: 워크플로우 페이지 하단
- **내용**: L0~L2 개념 3줄 요약 + "자세히 보기" CTA 버튼
- **링크**: `/harness`
- **목적**: 워크플로우 페이지 방문자를 하네스 독립 페이지로 유도

---

### WS-0: 공통 상수 단일 소스 (신규)

**파일**: `src/lib/stats.ts` (신규 생성)

WS-5(하네스 페이지)와 WS-6(About 페이지)에서 공통으로 사용하는 수치를 단일 파일에서 관리. 수치 불일치 방지 목적.

| 상수 | 설명 |
|------|------|
| `DECISION_COUNT` | 의사결정 수 (146+) |
| `AGENT_COUNT` | 에이전트 수 (7) |
| `HARNESS_VERSION_COUNT` | 하네스 버전 수 (5) |
| `ACTIVE_PROJECT_COUNT` | 활성 프로젝트 수 |
| `SERVICE_COUNT` | 서비스 수 |

- WS-5와 WS-6 모두 이 파일을 import하여 수치 참조
- 수치 변경 시 `stats.ts` 단일 파일만 수정

---

### WS-5: 하네스 독립 페이지 신규 생성 ⭐ 핵심

**라우트**: `/harness` (최상위)

**신규 파일:**
- `src/app/[locale]/harness/page.tsx`
- `src/app/[locale]/harness/HarnessPageContent.tsx` (또는 컴포넌트 분리)
- i18n 키: `messages/ko.json`, `messages/en.json`에 `harness` 네임스페이스 추가

**nav 메뉴:** "하네스 엔지니어링" (ko) / "Harness Engineering" (en) 항목 추가

#### 페이지 섹션 구성 (3막 구조)

페이지 전체를 3막 흐름으로 구성한다. 섹션 수는 유지하되, 아래 3막 프레임으로 묶는다.

---

**[1막: 문제]**

**섹션 1: Hero**

| 항목 | 내용 |
|------|------|
| 제목 | "AI 에이전트 8명이 코드를 수정하는 회사. 품질은 어떻게 보장하는가?" (ko) / "8 AI Agents Modifying Code. How Do We Ensure Quality?" (en) |
| 부제 | "AI 에이전트 품질 보증 시스템" (ko) / "AI Agent Quality Assurance System" (en) |
| 핵심 수치 | 146+ 의사결정 / 7 에이전트 / 5 버전 진화 (→ `src/lib/stats.ts` 참조) |
| 배경 | 기존 워크플로우 페이지와 동일한 클린 화이트 + 다크모드 스타일 |

---

**[2막: 해결]**

**섹션 2: 3계층 아키텍처 다이어그램**

| 레이어 | 이름 | 구성 요소 |
|--------|------|----------|
| L0 | Safety Net | pre-commit hook: 비밀정보 보호, 위험 명령 차단, Edit/Write 감시 |
| L1 | Enablement | Custom Subagent Architecture: agent.md, SKILL.md, 도구 권한 매트릭스 |
| L2 | Traceable Ops | run_id 추적, 로그 수집, KPI 측정 |

- **구현**: CSS/SVG로 확정 (React Flow 미사용)
- **이유**: 다이어그램 복잡도 분석 결과 정적 CSS/SVG로 충분히 표현 가능

**섹션 3: 에이전트 권한 매트릭스**

| 에이전트 | Write/Edit | Bash | 코딩 모델 |
|----------|:----------:|:----:|:--------:|
| CEO Agent | 차단 | allowlist | - |
| Fullstack Dev | 차단 | 오픈 | 하청 (codex exec) |
| QA Engineer | 차단 | 오픈 | 하청 (codex exec) |
| DevOps Engineer | 허용 | 오픈 | 직접 수정 |
| Board Advisor | 차단 | 제한 | 하청 (codex exec) |
| Historian | 허용 | 제한 | 직접 수정 |
| Content Writer | 허용 | 제한 | 직접 수정 |

---

**[3막: 결과]**

**섹션 4: 버전 히스토리 타임라인**

| 버전 | 핵심 변화 |
|------|----------|
| v1.0 | hooks 기반 초기 안전망 |
| v2.0 | SKILL.md 역할 정의 시스템 |
| v3.0 | L0 Safety Net 강화 (protect-secrets, block-dangerous-commands) |
| v4.0 | Custom Subagent Architecture — agent.md + 도구 권한 매트릭스 |
| v5.0 | Traceable Operations — run_id 추적 + 로그 수집 + KPI |

**섹션 5: KPI 섹션**

> 내부 검증 기준 수치입니다.

| KPI | 수치 |
|-----|------|
| 오탐률 | 0건 (Sprint D, 2026-03-11 기준) |
| E2E 파이프라인 성공률 | 100% (v4.0 Phase 1B-2 검증 기준) |
| 역할 인지율 | 100% (v4.0 스모크 테스트 기준) |

---

#### i18n

- 한/영 동시 지원 필수
- `messages/ko.json` 및 `messages/en.json`에 `harness` 키 추가
- 영문 번역 품질 확인 필수 (리스크 항목)

#### 디자인 가이드라인

- 기존 워크플로우 페이지와 동일한 클린 화이트 + 다크모드 스타일 유지
- 인터랙티브 요소: 순수 CSS/SVG (React Flow 미사용, 확정)
- 모바일 반응형 필수

---

### WS-6: About 페이지 + 통계 보정

**파일**: `messages/ko.json`, `messages/en.json`

- **미션 문구**: 하네스 관련 문구 추가 (AI 에이전트 품질 보증 체계 운영 언급)
- **통계 재계산**: ISCV 아카이브 반영 (→ `src/lib/stats.ts` 참조, WS-0)
  - 활성 프로젝트 수 재산정
  - 서비스 수 재산정

---

## 3. 수용 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 |
|---|------|----------|
| AC-1 | `/harness` 경로에서 한/영 하네스 페이지 정상 렌더링 | 브라우저 직접 확인 (ko/en) |
| AC-2 | 워크플로우 페이지 하단 teaser 카드에서 `/harness`로 정상 이동 | 클릭 → URL 확인 |
| AC-3 | nav 메뉴에 "하네스 엔지니어링"/"Harness Engineering" 항목 표시 및 정상 라우팅 | 메뉴 클릭 확인 |
| AC-4 | 프로젝트 데이터에서 ISCV가 featured에서 제외 | 홈 featured 섹션 확인 |
| AC-5 | 타임라인에 3월 이벤트 4건 정상 표시 | 타임라인 페이지 확인 |
| AC-6 | 로드맵 단기/중기 목표 업데이트 반영 | 로드맵 섹션 확인 |
| AC-7 | 통계 수치 정확성 (프로젝트 수, 서비스 수) | About 페이지 수치 대조 |
| AC-8 | 다크모드에서 모든 신규 섹션 정상 표시 | 다크모드 전환 후 확인 |
| AC-9 | 모바일 반응형 정상 | 모바일 뷰포트 확인 |
| AC-10 | Next.js 빌드 에러 0건 | `next build` 성공 |
| AC-11 | `/harness` 페이지 SEO 메타태그 + OG 이미지 정상 설정 | 메타태그 확인 (ko/en) |
| AC-12 | 워크플로우 teaser → `/harness` 및 nav 내부 링크 전수 확인 (broken link 0건) | 링크 전수 클릭 확인 |
| AC-13 | i18n 런타임 누락 키 0건 (빌드 + 실행 시 확인) | 빌드 로그 + 브라우저 콘솔 확인 |
| AC-14 | About ↔ Harness 페이지 통계 수치 일관성 확인 | 양 페이지 수치 대조 |

---

## 4. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 성능 | 기존 페이지 LCP, CLS 저하 없음 |
| i18n | 한/영 키 누락 없음 (빌드 타임 검증 권장) |
| 접근성 | 시맨틱 HTML 사용, 이미지 alt 텍스트 필수 |

---

## 5. 제외 범위

| 항목 | 이유 |
|------|------|
| 블로그 신규 작성 (BL-148, BL-092) | 별도 스프린트로 처리 |
| 하네스 페이지 내 실시간 KPI 대시보드 | 정적 수치만 표시 (v0.9.0 이후 검토) |
| 커스텀 도메인 변경 | 해당 스프린트 범위 외 |

---

## 6. 리스크 및 대응

| 리스크 | 심각도 | 대응 방안 |
|--------|--------|----------|
| 하네스 페이지 정보 과다 | Medium | 핵심 내용만 요약, 상세 내용은 접기/펼치기(accordion) 적용 |
| React Flow 다이어그램 복잡도 | Low | CSS/SVG로 확정하여 해소 |
| i18n 키 대량 추가 | Low | 영문 번역 품질 확인 필수, 누락 시 빌드 에러 발생 주의 |
| 기존 페이지 성능 저하 | Low | 신규 컴포넌트는 dynamic import 적용 검토 |

---

## 7. 워크스트림 의존관계

```
WS-0 (공통 상수 stats.ts)  ─────────────────────┐
                                                  ↓
WS-1 (프로젝트 데이터)   ─┐                 WS-5 (하네스 페이지)
WS-2 (타임라인)           ─┤                 WS-6 (About + 통계)
WS-3 (로드맵)             ─┼─→ 독립 병렬 가능
WS-6 (About + 통계)       ─┘

WS-5 (하네스 페이지) ─→ WS-4 (워크플로우 teaser) 의존
                         (harness 페이지 경로 확정 후 teaser 링크 연결)
```

---

## 8. 완료 정의 (Definition of Done)

- [ ] WS-0 ~ WS-6 전체 구현 완료
- [ ] AC-1 ~ AC-14 모두 통과
- [ ] `next build` 에러 0건
- [ ] 다크모드 + 모바일 반응형 확인
- [ ] i18n 키 한/영 누락 없음
- [ ] PROJECTS.md 버전 상태 업데이트 (v0.8.0 배포 완료 반영)
- [ ] HISTORY.md 마일스톤 기록

---

_작성: Company Historian | 근거: CEO 지시 (2026-03-11) | Board Advisor 검토 완료 (2026-03-11) | 관련 DEC: DEC-105, DEC-142, DEC-146_
