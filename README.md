# SidequestLab Homepage

SidequestLab 공식 홈페이지입니다.

## 기술 스택

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Blog**: MDX (next-mdx-remote)
- **Deployment**: Vercel

## 주요 기능

- 다국어 지원 (한국어/영어)
- 프로젝트 쇼케이스
- MDX 기반 블로그
- 반응형 디자인

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 프로젝트 구조

```
src/
├── app/
│   └── [locale]/           # 다국어 라우팅
│       ├── page.tsx        # 홈페이지
│       ├── projects/       # 프로젝트 페이지
│       ├── blog/           # 블로그 페이지
│       │   └── [slug]/     # 블로그 상세
│       └── about/          # 회사 소개
├── components/
│   ├── layout/             # Header, Footer, LanguageSwitcher
│   └── ui/                 # ProjectCard, BlogCard
├── i18n/                   # 다국어 설정
├── lib/                    # 유틸리티 (projects, blog)
content/
└── blog/                   # MDX 블로그 콘텐츠
    ├── ko/
    └── en/
messages/                   # 번역 파일
├── ko.json
└── en.json
```

## 블로그 작성

`content/blog/{locale}/` 디렉토리에 `.mdx` 파일을 추가합니다.

```mdx
---
title: 제목
description: 설명
date: 2026-01-27
---

마크다운 내용...
```

## 배포

Vercel에 연결하면 자동으로 배포됩니다.

```bash
# Vercel CLI로 배포
vercel
```

## 라이센스

MIT License
