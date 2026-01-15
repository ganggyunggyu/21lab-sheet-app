# Sheet-App 개발 가이드

## 프로젝트 개요

- **타입**: Next.js 16 App Router + Google Sheets Manager
- **패키지 매니저**: pnpm
- **아키텍처**: FSD (Feature-Sliced Design)
- **목적**: Google Sheets 데이터를 MongoDB와 동기화하고 관리하는 대시보드

## 기술 스택

### Core
- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript 5

### 상태 관리
- **TanStack Query 5.90.6** - 서버 상태 관리 (필수)
- **Jotai 2.15.1** - 클라이언트 상태 관리

### API & 데이터
- **Axios 1.13.2** - HTTP 클라이언트
- **Google APIs 164.1.0** - Google Sheets API 연동
- **Mongoose 8.19.3** - MongoDB ODM
- **Zod 4.1.12** - 스키마 검증

### UI & Styling
- **Tailwind CSS 4** - 유틸리티 CSS
- **Lucide React** - 아이콘
- **React Hot Toast** - 토스트 알림

## 디렉토리 구조 (FSD)

```
sheet-app/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── keywords/        # 키워드 CRUD API
│   │   │   ├── company/     # 회사별 키워드 API
│   │   │   ├── stats/       # 통계 API
│   │   │   └── sync/        # DB 동기화 API
│   │   └── sheets/[id]/     # Google Sheets 조회/수정 API
│   ├── sheets/[sheetId]/    # 동적 시트 페이지
│   ├── page.tsx             # 메인 페이지
│   ├── providers.tsx        # TanStack Query Provider
│   └── layout.tsx           # 루트 레이아웃
│
├── entities/                # 도메인 엔티티 레이어
│   ├── keyword/
│   │   ├── model/          # Mongoose Schema, Zod Schema
│   │   ├── api/            # DB CRUD 함수
│   │   └── lib/            # TanStack Query hooks
│   ├── sheet/
│   │   ├── model/          # Jotai atoms (filters, sheetName)
│   │   ├── api/            # Google Sheets API 호출
│   │   └── lib/            # hooks (useCompanyList)
│   └── theme/
│       ├── model/          # Jotai atoms (theme)
│       └── lib/            # hooks (useTheme)
│
├── features/                # 기능 레이어
│   ├── sheet-table/
│   │   ├── ui/             # SheetTable, TabSelector 컴포넌트
│   │   └── lib/            # TanStack Query hooks
│   └── theme-toggle/
│       └── ui/             # ThemeToggle 컴포넌트
│
├── shared/                  # 공유 레이어
│   ├── api/                # Axios 인스턴스
│   └── db/                 # MongoDB 연결
│
└── lib/                     # 서버 전용 유틸
    └── google-sheets.ts    # Google Sheets API 로직
```

## FSD 아키텍처 규칙

### 레이어 의존성

```
app → features → entities → shared
```

- 상위 레이어만 하위 레이어 import 가능
- **역방향 의존성 금지**

### Import 패턴

```typescript
// ✅ 권장: 레이어 최상위 export
import { SheetTable } from '@/features/sheet-table';
import { useCompanyList } from '@/entities/sheet';
import { apiClient } from '@/shared';

// ✅ 허용: 레이어 내부 세부 경로 (절대 경로만)
import { useSheetData } from '@/features/sheet-table/lib';
import { SheetTableFilters } from '@/features/sheet-table/ui/SheetTableFilters';

// ❌ 금지: 상대 경로 import
import { SheetTable } from '../ui/SheetTable';
```

### 각 레이어의 역할

**shared/**
- 공통 유틸리티, API 클라이언트, DB 연결
- 비즈니스 로직 없음

**entities/**
- 도메인 모델 정의 (schema, atoms)
- 도메인별 API 함수
- 도메인 중심 hooks

**features/**
- 사용자 기능 단위 컴포넌트
- UI + 기능별 TanStack Query hooks

**app/**
- Next.js 라우팅
- 페이지 구성
- 글로벌 Provider

## 개발 규칙

### TypeScript

```typescript
// ✅ 구조분해할당 필수
const { data, isLoading } = useQuery();

// ❌ 금지
const query = useQuery();
const data = query.data;

// ✅ className에는 cn 함수만 사용
import { cn } from '@/shared';

<div className={cn('rounded', isActive && 'bg-blue-600', className)} />;

// ✅ Fragment는 React.Fragment만 사용
return (
  <React.Fragment>
    <Header />
    <Main />
  </React.Fragment>
);

// ✅ Props 타입 정의
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### 상태 관리

**서버 상태: TanStack Query**

```typescript
// entities/keyword/lib/hooks.ts
export const useKeywords = () => {
  return useQuery({
    queryKey: ['keywords'],
    queryFn: () => api.get('/api/keywords'),
  });
};

// Mutation
export const useCreateKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KeywordInput) => api.post('/api/keywords', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });
};
```

**클라이언트 상태: Jotai**

```typescript
// entities/theme/model/atoms.ts
import { atom } from 'jotai';

export const themeAtom = atom<'light' | 'dark'>('light');

// entities/theme/lib/hooks.ts
import { useAtom } from 'jotai';
import { themeAtom } from '../model/atoms';

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
```

**Jotai 규칙**
- action은 atom에 두지 말고 hooks에서 조합
- 공용 로직은 `shared/hooks` 또는 도메인별 `entities/*/lib`에 배치

### API 라우트

```typescript
// app/api/keywords/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/shared/db';
import { Keyword } from '@/entities/keyword/model';

export async function GET() {
  await connectDB();
  const keywords = await Keyword.find();
  return NextResponse.json(keywords);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const data = await req.json();
  const keyword = await Keyword.create(data);
  return NextResponse.json(keyword);
}
```

### 컴포넌트

```typescript
// features/sheet-table/ui/SheetTable.tsx
import React from 'react';
import { useSheetData } from '@/features/sheet-table/lib';
import { cn } from '@/shared';

interface SheetTableProps {
  sheetId: string;
  sheetName: string;
}

export const SheetTable = ({ sheetId, sheetName }: SheetTableProps) => {
  const { data, isLoading } = useSheetData(sheetId, sheetName);

  if (isLoading) return <div>Loading...</div>;

  return (
    <React.Fragment>
      <table className={cn('w-full', 'border-collapse')}>
        {/* 테이블 렌더링 */}
      </table>
    </React.Fragment>
  );
};
```

### 스타일링

```typescript
// Tailwind 유틸리티 클래스 + cn 사용
<button
  className={cn(
    'px-4 py-2 rounded',
    'bg-blue-500 text-white hover:bg-blue-600'
  )}
>
  Click me
</button>

// 다크모드 지원
<div className={cn('bg-white text-black', 'dark:bg-gray-900 dark:text-white')}>
  Content
</div>
```

### 주석

```typescript
// ✅ 중요한 비즈니스 로직만 주석
// 회사별 키워드 노출 여부 일괄 업데이트
const syncCompanyKeywords = async (company: string) => {
  // ...
};

// ❌ 불필요한 설명 주석
// 버튼을 클릭하면 theme를 토글한다
const handleClick = () => toggleTheme();
```

## 실행 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 체크
pnpm lint
```

## 환경 변수

`.env.local` 파일 생성:

```bash
# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sheet-app
# 또는 MongoDB Atlas
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sheet-app
```

## 새 기능 추가 방법

### 1. Entity 추가

```bash
entities/
└── your-entity/
    ├── model/
    │   ├── schema.ts       # Mongoose/Zod Schema
    │   ├── atoms.ts        # Jotai atoms (옵션)
    │   └── index.ts
    ├── api/
    │   ├── api.ts          # API 함수
    │   └── index.ts
    ├── lib/
    │   ├── hooks.ts        # TanStack Query hooks
    │   └── index.ts
    └── index.ts            # Public API
```

### 2. Feature 추가

```bash
features/
└── your-feature/
    ├── ui/
    │   ├── Component.tsx
    │   └── index.ts
    ├── lib/
    │   ├── hooks.ts        # TanStack Query hooks
    │   └── index.ts
    └── index.ts
```

### 3. API 라우트 추가

```bash
app/api/
└── your-resource/
    ├── route.ts            # GET, POST
    └── [id]/
        └── route.ts        # GET, PUT, DELETE
```

## 참고 자료

### 외부 라이브러리
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Jotai 문서](https://jotai.org/)
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

### FSD 아키텍처
- [Feature-Sliced Design](https://feature-sliced.design/)

### 프로젝트 관련
- README.md - 프로젝트 전체 설명
- AGENTS.md - Repository Guidelines
