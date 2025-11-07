# 📊 Google Sheets Manager

Next.js 기반 Google Sheets 연동 관리 대시보드 애플리케이션

## ✨ 주요 기능

- 📋 **실시간 데이터 조회** - Google Sheets API 연동
- ✏️ **인라인 편집** - 셀 클릭으로 즉시 수정
- ➕ **행 추가** - 새로운 데이터 입력
- 🗂️ **다중 탭 지원** - 여러 시트 탭 전환
- 🔍 **스마트 필터링**
  - 날짜 기반 컬럼 자동 필터링 (±7일)
  - 노출 여부 필터 (전체/노출/미노출)
- 🔄 **시트 간 동기화** - 회사별 시트 노출 여부 일괄 업데이트
- 💾 **MongoDB 동기화** - Google Sheets 데이터를 MongoDB에 저장
  - 키워드별 노출 여부 관리
  - Upsert 패턴으로 최신 데이터만 유지
  - 크론 서버와 연동 가능
- 🎨 **다크모드 지원** - localStorage 기반 테마 저장
- 🚀 **최적화된 성능**
  - TanStack Query로 효율적인 데이터 캐싱
  - Optimistic Updates로 빠른 UI 반응

## 🛠 기술 스택

### Core
- **Next.js 16.0.1** - React 프레임워크 (App Router)
- **React 19.2.0** - UI 라이브러리
- **TypeScript 5** - 타입 안전성

### 상태 관리
- **TanStack Query 5.90.6** - 서버 상태 관리
- **Jotai 2.15.1** - 클라이언트 상태 관리

### API & 데이터
- **Axios 1.13.2** - HTTP 클라이언트
- **Google APIs 164.1.0** - Google Sheets API
- **MongoDB + Mongoose 8.19.3** - NoSQL 데이터베이스
- **Zod 4.1.12** - 스키마 검증

### UI & Styling
- **Tailwind CSS 4** - 유틸리티 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **React Hot Toast** - 토스트 알림

### 아키텍처
- **FSD (Feature-Sliced Design)** - 확장 가능한 프로젝트 구조

## 📁 프로젝트 구조 (FSD)

```
sheet-app/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── keywords/      # 키워드 CRUD API
│   │   └── sheets/[id]/   # Google Sheets API
│   ├── sheets/[sheetId]/  # 동적 페이지
│   ├── page.tsx           # 메인 페이지
│   └── providers.tsx      # 글로벌 Provider
├── entities/              # 비즈니스 도메인 엔티티
│   ├── keyword/
│   │   ├── model/        # Mongoose Schema
│   │   ├── api/          # DB CRUD 함수
│   │   └── lib/          # TanStack Query hooks
│   ├── sheet/
│   │   ├── model/        # Jotai atoms
│   │   ├── api/          # API 함수
│   │   └── lib/          # hooks
│   └── theme/
│       ├── model/
│       └── lib/
├── features/              # 사용자 기능 단위
│   ├── sheet-table/
│   │   ├── ui/           # SheetTable 컴포넌트
│   │   └── lib/          # TanStack Query hooks
│   └── theme-toggle/
│       └── ui/
├── shared/                # 공통 모듈
│   ├── api/              # Axios 클라이언트
│   └── db/               # MongoDB 연결
└── lib/                   # 서버 전용 유틸
    └── google-sheets.ts  # Google Sheets API 로직
```

## 🚀 시작하기

### 1. Google Cloud 서비스 계정 설정

#### 1.1 프로젝트 생성 및 API 활성화

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. **API 및 서비스** → **라이브러리** → **Google Sheets API** 검색 후 활성화

#### 1.2 서비스 계정 생성

1. **API 및 서비스** → **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **서비스 계정**
3. 서비스 계정 이름 입력 후 생성
4. 생성된 서비스 계정 클릭
5. **키** 탭 → **키 추가** → **새 키 만들기** → **JSON** 선택
6. JSON 파일 다운로드 (안전한 곳에 보관)

### 2. MongoDB 설치 및 설정

#### 옵션 1: 로컬 MongoDB 설치

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# MongoDB 시작
brew services start mongodb-community

# 연결 확인
mongosh
```

#### 옵션 2: MongoDB Atlas (클라우드)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 회원가입
2. 무료 클러스터 생성 (M0 Sandbox)
3. Database Access에서 사용자 추가
4. Network Access에서 IP 화이트리스트 추가 (개발 시 0.0.0.0/0)
5. Connect → Connect your application에서 연결 URI 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.local
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# MongoDB 연결 URI
MONGODB_URI=mongodb://localhost:27017/sheet-app
# 또는 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sheet-app
```

**설정 방법:**
1. 다운로드한 JSON 파일 열기
2. `client_email` 값을 `GOOGLE_SERVICE_ACCOUNT_EMAIL`에 복사
3. `private_key` 값을 `GOOGLE_PRIVATE_KEY`에 복사 (따옴표로 감싸기)
4. MongoDB URI를 `MONGODB_URI`에 설정

⚠️ **주의**:
- `private_key`는 `\n` 줄바꿈 문자를 포함하여 그대로 복사
- MongoDB Atlas 사용 시 username과 password를 실제 값으로 변경

### 4. Google Sheets 권한 설정

1. 관리할 Google Sheets 문서 열기
2. **공유** 버튼 클릭
3. 서비스 계정 이메일 추가 (`GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. 권한: **편집자** 선택
5. 완료

### 5. 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 체크
pnpm lint
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000) 접속

## 📝 사용 방법

### 시트 ID 확인

Google Sheets URL에서 ID 추출:
```
https://docs.google.com/spreadsheets/d/[시트_ID]/edit
                                      ↑
                                  여기가 시트 ID
```

### 코드에서 시트 ID 설정

`app/page.tsx` 파일에서 기본 시트 ID 변경:

```typescript
const SHEET_ID = '여기에_시트_ID_입력';
const SHEET_NAMES = {
  PACKAGE: '패키지',
  DOGMARU_EXCLUDE: '도그마루 제외',
} as const;
```

## 🏗 아키텍처 설명

### FSD (Feature-Sliced Design)

이 프로젝트는 FSD 아키텍처 원칙을 따릅니다:

#### 레이어 구조
- **shared** - 공통 모듈 (API 클라이언트, 유틸리티)
- **entities** - 비즈니스 도메인 (sheet, theme)
- **features** - 사용자 기능 (sheet-table, theme-toggle)
- **app** - Next.js 라우팅 및 페이지

#### 의존성 규칙
- 상위 레이어만 하위 레이어를 import
- `features` → `entities` → `shared` ✅
- 역방향 의존성 금지 ❌

#### Import 패턴

```typescript
// ✅ 권장: 최상위 레이어에서 import
import { SheetTable, ThemeToggle } from '@/features';
import { useCompanyList, useTheme } from '@/entities';
import { api } from '@/shared';

// ✅ 허용: 뎁스별 import (더 명시적)
import { SheetTable } from '@/features/sheet-table/ui';
import { useCompanyList } from '@/entities/sheet/lib';

// ❌ 금지: 직접 파일 import
import { SheetTable } from '@/features/sheet-table/ui/SheetTable';
```

## 🔧 개발 가이드

### 새 Entity 추가

```bash
entities/
└── your-entity/
    ├── model/
    │   ├── atoms.ts      # Jotai atoms
    │   └── index.ts
    ├── api/
    │   ├── api.ts        # API 함수
    │   └── index.ts
    ├── lib/
    │   ├── hooks.ts      # Custom hooks
    │   └── index.ts
    └── index.ts          # Public API
```

### 새 Feature 추가

```bash
features/
└── your-feature/
    ├── ui/
    │   ├── Component.tsx
    │   └── index.ts
    ├── lib/
    │   ├── hooks.ts      # TanStack Query hooks
    │   └── index.ts
    └── index.ts
```

### 개발 규칙

- **구조분해할당 필수** (불가피한 경우 제외)
- **Props 타입 정의** 인터페이스로 명시
- **TanStack Query** 서버 상태 관리 필수
- **Jotai** 클라이언트 상태 관리
- **주석 최소화** (중요한 로직만)

자세한 내용은 [.claude/AGENT.md](.claude/AGENT.md) 참고

## 📄 라이센스

MIT

## 🤝 기여

이슈 및 PR 환영합니다!

---

**Built with ❤️ using Next.js 16 & FSD Architecture**
