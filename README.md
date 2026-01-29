# Next Jira Core Web

Jira 스타일의 프로젝트 관리 웹 애플리케이션입니다. Next.js 16과 React 19를 기반으로 구축되었으며, Java Spring Boot API와 통합할 수 있도록 설계되었습니다.

## 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [주요 기능](#주요-기능)
- [개발 가이드](#개발-가이드)

## 기술 스택

### Core

- **Next.js** `16.1.1` - React 프레임워크 (App Router)
- **React** `19.2.3` - UI 라이브러리
- **TypeScript** `^5` - 타입 안정성

### UI & Styling

- **Tailwind CSS** `^4` - 유틸리티 기반 CSS 프레임워크
- **shadcn/ui** - Radix UI 기반 컴포넌트 라이브러리
- **Lucide React** `^0.562.0` - 아이콘 라이브러리
- **class-variance-authority** `^0.7.1` - 컴포넌트 variant 관리
- **tailwind-merge** `^3.4.0` - Tailwind 클래스 병합

### State Management

- **Zustand** `^5.0.9` - 클라이언트 상태 관리
- **TanStack Query** `^5.90.16` - 서버 상태 관리 및 데이터 페칭
- **TanStack Query Devtools** `^5.91.2` - 개발 도구

### Internationalization

- **next-intl** `^4.7.0` - 다국어 지원 (한국어/영어)

### API & Mocking

- **Axios** `^1.13.2` - HTTP 클라이언트
- **MSW** `^2.12.7` - Mock Service Worker (API 모킹)

### Drag & Drop

- **@dnd-kit/core** `^6.3.1` - 드래그 앤 드롭 코어
- **@dnd-kit/sortable** `^10.0.0` - 정렬 가능한 리스트
- **@dnd-kit/utilities** `^3.2.2` - 유틸리티 함수

### Utilities

- **Day.js** `^1.11.19` - 날짜/시간 처리
- **clsx** `^2.1.1` - 조건부 클래스명

### Development Tools

- **ESLint** `^9` - 코드 린팅
- **Prettier** `^3.7.4` - 코드 포맷팅
- **Storybook** `^10.1.11` - 컴포넌트 문서화 및 테스트
- **Vitest** `^4.0.16` - 단위 테스트 프레임워크
- **Playwright** `^1.57.0` - E2E 테스트

## 프로젝트 구조

```
next-jira-core-web/
├── public/                    # 정적 파일
│   └── mockServiceWorker.js   # MSW Service Worker
├── src/
│   ├── app/                   # Next.js App Router 페이지
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 홈 페이지
│   │   ├── dashboard/         # 대시보드 페이지
│   │   └── example/           # 예제 페이지
│   │
│   ├── _features/             # 기능별 모듈 (도메인 기반)
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── components/    # 공통 UI 컴포넌트
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── AppHeader.tsx
│   │   │   │   ├── AppSidebar.tsx
│   │   │   │   └── ui/        # shadcn/ui 컴포넌트
│   │   │   └── hooks/          # 공통 훅
│   │   ├── projects/          # 프로젝트 기능
│   │   │   ├── components/    # 프로젝트 관련 컴포넌트
│   │   │   └── hooks/         # 프로젝트 관련 훅
│   │   └── example/           # 예제 기능
│   │
│   ├── _libraries/            # 외부 라이브러리 설정
│   │   ├── api/               # API 클라이언트 설정
│   │   │   ├── client.ts      # Axios 인스턴스
│   │   │   ├── handlers.ts    # MSW 핸들러
│   │   │   ├── msw.ts         # MSW 초기화
│   │   │   └── index.ts       # API export
│   │   └── i18n/              # 다국어 설정
│   │       ├── routing.ts     # 라우팅 설정
│   │       └── request.ts     # 요청 설정
│   │
│   ├── _providers/            # React Context Providers
│   │   ├── AppProvider.tsx    # 메인 Provider
│   │   ├── query-provider.tsx # TanStack Query Provider
│   │   ├── msw-provider.tsx   # MSW Provider
│   │   ├── api-provider.tsx   # 실제 API Provider
│   │   └── api-provider-wrapper.tsx # Provider 분기 처리
│   │
│   ├── _messages/             # 다국어 메시지 파일
│   │   ├── ko.json            # 한국어
│   │   └── en.json            # 영어
│   │
│   ├── _utilities/            # 유틸리티 함수
│   │   ├── utilities.ts       # 공통 유틸리티 (cn 등)
│   │   └── date.ts            # 날짜 관련 유틸리티
│   │
│   ├── _constants/            # 상수 정의
│   ├── _sections/             # 섹션 컴포넌트
│   └── _stories/              # Storybook 스토리
│
├── types/                     # TypeScript 타입 정의
├── .vscode/                   # VSCode 설정
├── components.json            # shadcn/ui 설정
├── next.config.ts             # Next.js 설정
├── tsconfig.json              # TypeScript 설정
├── eslint.config.mjs          # ESLint 설정
├── .prettierrc                # Prettier 설정
└── package.json               # 프로젝트 의존성
```

### 폴더 구조 설명

- **`_features/`**: 기능별로 분리된 모듈 (도메인 기반 아키텍처)
- **`_libraries/`**: 외부 라이브러리 설정 및 래퍼
- **`_providers/`**: React Context Provider 컴포넌트
- **`_utilities/`**: 재사용 가능한 유틸리티 함수
- **`_messages/`**: 다국어 번역 파일
- **`_constants/`**: 프로젝트 전역 상수
- **`_sections/`**: 페이지 섹션 컴포넌트
- **`_stores/`**: 상태 관리
- **`_stories/`**: Storybook 스토리 파일

## 시작하기

### 필수 요구사항

- Node.js 18+
- pnpm (권장) 또는 npm/yarn

### 설치

```bash
# 의존성 설치
pnpm install
npx auth secret

# MSW Service Worker 초기화 (최초 1회)
pnpm msw:init
```

### 개발 서버 실행

```bash
# 일반 개발 서버 (실제 API 사용)
pnpm dev

# Mock API 사용 개발 서버
pnpm dev:mock
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# MSW 사용 여부 (true: Mock API, false: 실제 API)
NEXT_PUBLIC_USE_MSW=true
```

## 주요 기능

### 1. 다국어 지원 (i18n)

- 한국어/영어 지원
- `next-intl`을 사용한 서버/클라이언트 컴포넌트 모두 지원

### 2. Mock API (MSW)

- 개발 환경에서 실제 API 없이 개발 가능
- Service Worker를 통한 네트워크 요청 인터셉트
- 환경 변수로 Mock/실제 API 전환

### 3. API 클라이언트

- Axios 기반 통합 API 클라이언트
- JWT 토큰 자동 주입
- 에러 처리 및 인터셉터

### 4. 상태 관리

- **Zustand**: 클라이언트 상태 (UI 상태 등)
- **TanStack Query**: 서버 상태 (API 데이터 캐싱, 동기화)

### 5. UI 컴포넌트

- shadcn/ui 기반 재사용 가능한 컴포넌트
- Radix UI 기반 접근성 지원
- Tailwind CSS로 스타일링

### 6. 드래그 앤 드롭

- `@dnd-kit`을 사용한 드래그 앤 드롭 기능
- 정렬 가능한 리스트 지원

## 개발 가이드

### 코드 스타일

```bash
# 코드 포맷팅
pnpm format

# 포맷팅 체크
pnpm format:check

# 린팅
pnpm lint

# 린팅 자동 수정
pnpm lint:fix
```

### 컴포넌트 개발

새로운 기능 컴포넌트는 `src/_features/{feature-name}/components/`에 생성하세요.

```typescript
// src/_features/projects/components/project-card.tsx
"use client";

import { Button } from "@/_features/common/components/ui/button";

export function ProjectCard({ project }: { project: Project }) {
  // ...
}
```

### API 호출

```typescript
// React Query 훅 사용
import { useQuery } from "@tanstack/react-query";
import { api } from "@/_libraries/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });
}
```

### 다국어 사용

```typescript
// 서버 컴포넌트
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}

// 클라이언트 컴포넌트
import { useTranslations } from "next-intl";

export default function Component() {
  const t = useTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}
```

### Storybook

```bash
# Storybook 개발 서버 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook
```

### 테스트

```bash
# Vitest 실행
pnpm test

# 커버리지 포함 테스트
pnpm test:coverage
```

## 추가 문서

- [API 설정 가이드](./README-API.md) - MSW 및 API 클라이언트 사용법

## 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [MSW 문서](https://mswjs.io/)
- [next-intl 문서](https://next-intl-docs.vercel.app/)

## 라이선스

Private
