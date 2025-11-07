# Sheet App - Next.js Google Sheets 관리 앱

## 프로젝트 개요

- **타입**: Next.js 16 App Router (Google Sheets 관리 애플리케이션)
- **패키지 매니저**: pnpm
- **빌드 도구**: Next.js 16 + Turbopack

## 기술 스택

### 핵심

- **Next.js 16.0.1** - React 프레임워크 (App Router)
- **React 19.2.0** - UI 라이브러리
- **TypeScript 5** - 타입 시스템

### 상태 관리

- **TanStack Query 5.90.6** - 서버 상태 관리 (필수)
- **Jotai 2.15.1** - 클라이언트 상태 관리

### API & 데이터

- **Axios 1.13.2** - HTTP 클라이언트
- **Google APIs 164.1.0** - Google Sheets API 연동
- **Zod 4.1.12** - 스키마 검증

### UI & 스타일링

- **Tailwind CSS 4** - 유틸리티 CSS 프레임워크
- **Lucide React 0.552.0** - 아이콘
- **React Hot Toast 2.6.0** - 토스트 알림

## 디렉토리 구조 (FSD - Feature-Sliced Design)

```
sheet-app/
├── app/                       # Next.js App Router
│   ├── api/
│   │   └── sheets/
│   │       └── [id]/          # Google Sheets API 라우트
│   │           ├── route.ts
│   │           ├── sync/
│   │           └── metadata/
│   ├── sheets/
│   │   └── [sheetId]/         # 동적 Sheet 페이지
│   │       └── page.tsx
│   ├── layout.tsx             # 루트 레이아웃
│   ├── page.tsx               # 메인 페이지
│   ├── providers.tsx          # 글로벌 Provider
│   └── globals.css
├── entities/                  # 비즈니스 도메인 엔티티
│   ├── sheet/
│   │   ├── model/             # Jotai atoms
│   │   │   └── atoms.ts
│   │   ├── api/               # API 함수
│   │   │   └── api.ts
│   │   ├── lib/               # hooks
│   │   │   └── hooks.ts
│   │   └── index.ts           # Public API
│   └── theme/
│       ├── model/
│       │   └── atoms.ts
│       ├── lib/
│       │   └── hooks.ts
│       └── index.ts
├── features/                  # 기능 단위 모듈
│   ├── sheet-table/
│   │   ├── ui/
│   │   │   └── SheetTable.tsx
│   │   ├── lib/               # TanStack Query hooks
│   │   │   └── hooks.ts
│   │   └── index.ts
│   └── theme-toggle/
│       ├── ui/
│       │   └── ThemeToggle.tsx
│       └── index.ts
├── shared/                    # 공통 모듈
│   ├── api/
│   │   └── client.ts          # Axios 인스턴스
│   └── index.ts
└── lib/
    └── google-sheets.ts       # 서버 전용 Google Sheets API 로직
```

## 개발 규칙

### TypeScript

- **구조분해할당 필수** (불가피한 경우 제외)
- **엄격한 타입 정의** (`strict: true`)
- Props와 API 응답은 타입/인터페이스 정의 필수

### React 컴포넌트

- 함수형 컴포넌트 사용
- `'use client'` 디렉티브 명시 (클라이언트 컴포넌트)
- Props 타입 인터페이스로 정의

```typescript
interface ComponentProps {
  sheetId: string;
  sheetName?: string;
}

export const Component = ({ sheetId, sheetName }: ComponentProps) => {
  // ...
};
```

### 상태 관리

#### 서버 상태 (TanStack Query)

- **모든 서버 데이터 fetching은 TanStack Query 사용**
- Query Keys는 `queryKeys` 객체로 중앙화 관리
- `useQuery`, `useMutation` 훅으로 분리

```typescript
// features/sheet-table/lib/hooks.ts
export const queryKeys = {
  sheets: {
    all: ['sheets'] as const,
    detail: (sheetId: string, sheetName?: string) =>
      [...queryKeys.sheets.all, sheetId, sheetName] as const,
  },
};

export const useSheetData = (sheetId: string, sheetName?: string) => {
  return useQuery({
    queryKey: queryKeys.sheets.detail(sheetId, sheetName),
    queryFn: () => fetchSheetData(sheetId, sheetName),
    enabled: !!sheetId,
  });
};
```

```typescript
// 사용 (import)
import { useSheetData, queryKeys } from '@/features/sheet-table';
// 또는
import { useSheetData } from '@/features/sheet-table/lib';
```

#### 클라이언트 상태 (Jotai)

- 전역 UI 상태 관리 (테마, 임시 데이터 등)
- `entities/{domain}/model/` 에 atom 정의
- 각 뎁스마다 `index.ts`로 export

```typescript
// entities/theme/model/atoms.ts
import { atomWithStorage } from 'jotai/utils';

export type Theme = 'light' | 'dark';
export const themeAtom = atomWithStorage<Theme>('theme', 'light');
```

```typescript
// 사용 (import)
import { themeAtom } from '@/entities/theme';
// 또는
import { themeAtom } from '@/entities/theme/model';
```

### API 통신

- `shared/api/client.ts`의 Axios 인스턴스 사용
- API 함수는 `entities/{domain}/api/` 에 정의
- 에러 핸들링 필수

```typescript
// entities/sheet/api/api.ts
import { api } from '@/shared';

export const fetchSheetData = async (sheetId: string, sheetName?: string) => {
  const url = sheetName
    ? `/sheets/${sheetId}?sheetName=${encodeURIComponent(sheetName)}`
    : `/sheets/${sheetId}`;
  return api.get(url);
};
```

```typescript
// 사용 (import)
import { fetchSheetData } from '@/entities/sheet';
// 또는
import { fetchSheetData } from '@/entities/sheet/api';
```

### 스타일링 (Tailwind CSS)

- 유틸리티 클래스 사용
- 다크 모드 지원: `dark:` prefix
- 반응형: `sm:`, `md:`, `lg:` breakpoints

```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500">
    버튼
  </button>
</div>
```

### 주석

- **정말 중요하고 작업 관련있는 주석만 작성**
- 설명용 주석 지양
- 복잡한 로직, 비즈니스 로직 이유 설명 시에만 사용

### FSD 아키텍처 원칙

#### 레이어 구조

- **entities** - 비즈니스 도메인 엔티티 (sheet, theme 등)
- **features** - 사용자 기능 단위 (sheet-table, theme-toggle 등)
- **shared** - 공통 모듈 (api, lib, ui 등)

#### 의존성 규칙

- 상위 레이어만 하위 레이어를 import 가능
- `features` → `entities`, `shared` ✅
- `entities` → `shared` ✅
- `shared` → 외부 라이브러리만 ✅
- 역방향 의존성 금지 ❌

#### Index Export 패턴

- 각 레이어, 도메인, 뎁스마다 `index.ts` 생성
- Public API만 export
- import는 최상위 또는 뎁스별로 가능

```typescript
// ✅ 권장: 최상위 레이어에서 import
import { SheetTable } from '@/features/sheet-table';
import { themeAtom, useTheme } from '@/entities/theme';

// ✅ 허용: 뎁스별 import (더 명시적)
import { SheetTable } from '@/features/sheet-table/ui';
import { themeAtom } from '@/entities/theme/model';
import { useTheme } from '@/entities/theme/lib';

// ❌ 금지: 직접 파일 import
import { SheetTable } from '@/features/sheet-table/ui/SheetTable';
import { themeAtom } from '@/entities/theme/model/atoms';
```

#### 파일 배치 규칙

**entities/{domain}/**
- `model/` - Jotai atoms, 타입 정의
- `api/` - API 함수
- `lib/` - hooks, 유틸리티
- `index.ts` - Public API export

**features/{feature}/**
- `ui/` - React 컴포넌트
- `lib/` - hooks (TanStack Query 등)
- `index.ts` - Public API export

**shared/**
- `api/` - HTTP 클라이언트
- `lib/` - 공통 유틸리티
- `ui/` - 공통 UI 컴포넌트
- `index.ts` - Public API export

## 실행 명령어

```bash
# 개발 서버 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint
```

## 주요 기능

### Google Sheets 연동

- Google Sheets API로 스프레드시트 데이터 조회
- 실시간 셀 수정 (inline editing)
- 행 추가 기능
- 시트 간 네비게이션

### 데이터 필터링

- 날짜 기반 컬럼 자동 필터링 (±7일)
- 노출 여부 필터링 (전체/노출/미노출)

### 동기화

- 회사별 시트의 노출 여부 동기화 기능

## 환경 변수

Google Sheets API 인증 정보 필요 (환경 변수 또는 서비스 계정 설정)

## 참고

- 모든 API는 `/api/sheets/[id]/*` 라우트 핸들러로 처리
- 클라이언트 컴포넌트는 `'use client'` 필수
- 서버 컴포넌트는 기본값 (디렉티브 불필요)
