# Google Sheets Manager 사용 가이드

이 문서는 컴퓨터에 아무것도 설치되어 있지 않은 상태에서 Google Sheets Manager를 설치하고 실행하는 방법을 설명합니다.

## 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [Mac 환경 설정](#mac-환경-설정)
3. [Windows 환경 설정](#windows-환경-설정)
4. [프로젝트 설정](#프로젝트-설정)
5. [Google Sheets API 설정](#google-sheets-api-설정)
6. [MongoDB 설정](#mongodb-설정)
7. [실행 방법](#실행-방법)
8. [기능 사용 가이드](#기능-사용-가이드)
9. [문제 해결](#문제-해결)

---

## 시스템 요구사항

- **운영체제**: macOS 10.15 이상 또는 Windows 10 이상
- **RAM**: 최소 4GB (권장 8GB)
- **저장공간**: 최소 2GB 여유 공간
- **인터넷 연결**: 필수

---

## Mac 환경 설정

### 1. Homebrew 설치 (Mac용 패키지 관리자)

1. **터미널 열기**
   - `Spotlight 검색 (⌘ + Space)` → `terminal` 입력 → Enter

2. **Homebrew 설치**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **설치 확인**
   ```bash
   brew --version
   ```
   버전 정보가 나오면 성공!

### 2. Node.js 설치 (JavaScript 실행 환경)

1. **Node.js 설치**
   ```bash
   brew install node
   ```

2. **설치 확인**
   ```bash
   node --version
   npm --version
   ```
   둘 다 버전 정보가 나오면 성공!

### 3. pnpm 설치 (패키지 관리자)

1. **pnpm 설치**
   ```bash
   npm install -g pnpm
   ```

2. **설치 확인**
   ```bash
   pnpm --version
   ```

### 4. Git 설치 (코드 버전 관리)

1. **Git 설치**
   ```bash
   brew install git
   ```

2. **설치 확인**
   ```bash
   git --version
   ```

### 5. MongoDB 설치 (데이터베이스)

**옵션 A: 로컬 설치**

1. **MongoDB 설치**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **MongoDB 시작**
   ```bash
   brew services start mongodb-community
   ```

3. **설치 확인**
   ```bash
   mongosh
   ```
   MongoDB 셸이 열리면 성공! `exit` 입력하여 나가기

**옵션 B: MongoDB Atlas (클라우드) 사용**
- [MongoDB Atlas 설정](#mongodb-설정) 섹션 참고

---

## Windows 환경 설정

### 1. Node.js 설치

1. **Node.js 다운로드**
   - 브라우저에서 https://nodejs.org 접속
   - "LTS" 버전 다운로드 (녹색 버튼)
   - 다운로드한 `.msi` 파일 실행

2. **설치 진행**
   - "Next" 클릭
   - 라이선스 동의 체크 → "Next"
   - 설치 경로 확인 → "Next"
   - "Automatically install necessary tools" 체크 → "Next"
   - "Install" 클릭
   - 관리자 권한 요청 시 "예" 클릭

3. **설치 확인**
   - `시작 메뉴` → `cmd` 입력 → "명령 프롬프트" 실행
   ```cmd
   node --version
   npm --version
   ```
   버전 정보가 나오면 성공!

### 2. pnpm 설치

1. **명령 프롬프트 실행** (관리자 권한)
   - `시작 메뉴` → `cmd` 입력 → 우클릭 → "관리자 권한으로 실행"

2. **pnpm 설치**
   ```cmd
   npm install -g pnpm
   ```

3. **설치 확인**
   ```cmd
   pnpm --version
   ```

### 3. Git 설치

1. **Git 다운로드**
   - 브라우저에서 https://git-scm.com/download/win 접속
   - 자동으로 다운로드 시작 (안되면 "Click here to download" 클릭)
   - 다운로드한 `.exe` 파일 실행

2. **설치 진행**
   - "Next" 여러 번 클릭 (기본 설정 사용)
   - "Install" 클릭
   - "Finish" 클릭

3. **설치 확인**
   - 명령 프롬프트에서:
   ```cmd
   git --version
   ```

### 4. MongoDB 설치

**옵션 A: 로컬 설치**

1. **MongoDB 다운로드**
   - https://www.mongodb.com/try/download/community 접속
   - "Version": 최신 버전
   - "Platform": Windows
   - "Download" 클릭

2. **설치 진행**
   - 다운로드한 `.msi` 파일 실행
   - "Next" → "Accept" → "Complete" 선택
   - "Install MongoDB as a Service" 체크 유지
   - "Install MongoDB Compass" 체크 (GUI 도구)
   - "Install" 클릭

3. **설치 확인**
   - `시작 메뉴` → `MongoDB Compass` 실행
   - 연결 확인

**옵션 B: MongoDB Atlas (클라우드) 사용 - 권장**
- [MongoDB 설정](#mongodb-설정) 섹션 참고

---

## 프로젝트 설정

### 1. 코드 다운로드

**옵션 A: Git으로 클론 (권장)**

Mac (터미널):
```bash
cd ~/Documents
git clone [저장소 URL]
cd sheet-app
```

Windows (명령 프롬프트):
```cmd
cd %USERPROFILE%\Documents
git clone [저장소 URL]
cd sheet-app
```

**옵션 B: ZIP 파일 다운로드**

1. GitHub 저장소 페이지에서 "Code" → "Download ZIP" 클릭
2. 다운로드한 파일 압축 해제
3. 터미널/명령 프롬프트에서 해당 폴더로 이동

### 2. 의존성 설치

프로젝트 폴더에서:

```bash
pnpm install
```

이 과정은 몇 분 정도 걸릴 수 있습니다.

---

## Google Sheets API 설정

### 1. Google Cloud Console 프로젝트 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com 접속
   - Google 계정으로 로그인

2. **프로젝트 생성**
   - 상단 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭
   - 프로젝트 이름 입력 (예: "sheet-manager")
   - "만들기" 클릭

3. **프로젝트 선택**
   - 상단에서 방금 만든 프로젝트 선택

### 2. Google Sheets API 활성화

1. **API 및 서비스 메뉴**
   - 왼쪽 메뉴 → "API 및 서비스" → "라이브러리"

2. **Google Sheets API 검색**
   - 검색창에 "Google Sheets API" 입력
   - 검색 결과에서 "Google Sheets API" 클릭
   - "사용" 버튼 클릭

### 3. 서비스 계정 생성

1. **서비스 계정 메뉴**
   - 왼쪽 메뉴 → "API 및 서비스" → "사용자 인증 정보"
   - "사용자 인증 정보 만들기" → "서비스 계정" 클릭

2. **서비스 계정 정보 입력**
   - 서비스 계정 이름: `sheet-manager-service`
   - 서비스 계정 ID: 자동 생성됨
   - "만들고 계속하기" 클릭

3. **역할 부여 (선택사항)**
   - "계속" 클릭 (역할 없이 진행)

4. **완료**
   - "완료" 클릭

### 4. 서비스 계정 키 생성

1. **서비스 계정 목록**
   - "API 및 서비스" → "사용자 인증 정보"
   - 방금 만든 서비스 계정 이메일 클릭

2. **키 생성**
   - "키" 탭 클릭
   - "키 추가" → "새 키 만들기"
   - "JSON" 선택
   - "만들기" 클릭
   - **중요**: JSON 파일이 자동으로 다운로드됩니다!

3. **JSON 파일 이름 변경 및 이동**

   Mac:
   ```bash
   mv ~/Downloads/[다운로드된파일명].json ~/Documents/sheet-app/credentials.json
   ```

   Windows:
   ```cmd
   move %USERPROFILE%\Downloads\[다운로드된파일명].json %USERPROFILE%\Documents\sheet-app\credentials.json
   ```

### 5. Google Sheets에 권한 부여

1. **서비스 계정 이메일 복사**
   - JSON 파일을 텍스트 에디터로 열기
   - `client_email` 값 복사 (예: `sheet-manager-service@...`)

2. **Google Sheets 공유**
   - 사용할 Google Sheets 파일 열기
   - 오른쪽 상단 "공유" 버튼 클릭
   - 복사한 서비스 계정 이메일 붙여넣기
   - "편집자" 권한 선택
   - "완료" 클릭

---

## MongoDB 설정

### 옵션 A: 로컬 MongoDB 사용

로컬에 MongoDB를 설치했다면 별도 설정 불필요.

환경 변수 파일(`.env.local`)에:
```env
MONGODB_URI=mongodb://localhost:27017/sheet-manager
```

### 옵션 B: MongoDB Atlas 사용 (권장)

#### 1. MongoDB Atlas 계정 생성

1. **MongoDB Atlas 접속**
   - https://www.mongodb.com/cloud/atlas/register 접속
   - 이메일, 비밀번호 입력하여 가입
   - 또는 Google 계정으로 가입

2. **설문조사**
   - 간단한 설문조사 나오면 아무거나 선택 후 "Finish"

#### 2. 클러스터 생성

1. **무료 클러스터 선택**
   - "Create a deployment" 또는 "Build a Database" 클릭
   - "Shared" (무료) 선택
   - "Create" 클릭

2. **클라우드 제공자 선택**
   - AWS, Google Cloud, Azure 중 선택 (AWS 추천)
   - Region: 가까운 지역 선택 (예: Seoul, Tokyo)
   - "Create Cluster" 클릭

#### 3. 데이터베이스 사용자 생성

1. **Security 설정**
   - "Security Quick Start" 화면이 나타남
   - "Username": 원하는 사용자명 입력 (예: `admin`)
   - "Password": 강력한 비밀번호 입력 (복사해두기!)
   - "Create User" 클릭

#### 4. IP 주소 허용

1. **Network Access 설정**
   - "Add entries to your IP Access List" 섹션
   - "Add My Current IP Address" 클릭
   - 또는 "Allow Access from Anywhere" 클릭 (0.0.0.0/0)
   - "Finish and Close" 클릭

#### 5. 연결 문자열 가져오기

1. **Connect 클릭**
   - 클러스터 목록에서 "Connect" 버튼 클릭

2. **연결 방법 선택**
   - "Drivers" 선택
   - "Driver": Node.js
   - "Version": 최신 버전 선택

3. **연결 문자열 복사**
   - "connection string" 부분 복사
   - 예: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

4. **비밀번호 수정**
   - `<password>` 부분을 실제 비밀번호로 변경
   - 예: `mongodb+srv://admin:mypassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## 환경 변수 설정

### 1. `.env.local` 파일 생성

프로젝트 폴더 최상위에 `.env.local` 파일 생성:

Mac (터미널):
```bash
touch .env.local
```

Windows (명령 프롬프트):
```cmd
type nul > .env.local
```

### 2. 환경 변수 입력

텍스트 에디터로 `.env.local` 파일을 열고 다음 내용 입력:

```env
# MongoDB 연결 문자열
MONGODB_URI=mongodb+srv://admin:mypassword123@cluster0.xxxxx.mongodb.net/sheet-manager?retryWrites=true&w=majority

# Google Sheets API 설정
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

**주의사항:**
- `MONGODB_URI`: MongoDB Atlas 연결 문자열 (또는 `mongodb://localhost:27017/sheet-manager`)
- `GOOGLE_APPLICATION_CREDENTIALS`: 다운로드한 JSON 파일 경로
- 비밀번호에 특수문자가 있으면 URL 인코딩 필요 (예: `@` → `%40`)

### 3. 파일 저장

- Mac: `⌘ + S`
- Windows: `Ctrl + S`

---

## 실행 방법

### 1. 개발 서버 실행

프로젝트 폴더에서:

```bash
pnpm dev
```

### 2. 브라우저에서 확인

- 자동으로 브라우저가 열리지 않으면 http://localhost:3000 접속
- 다음 메시지가 나오면 성공:
  ```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  ```

### 3. 서버 중지

- Mac: `Ctrl + C`
- Windows: `Ctrl + C`

---

## 기능 사용 가이드

### 1. 메인 페이지 (`/`)

#### 탭 선택
- **패키지**: 패키지 키워드 관리
- **도그마루 제외**: 도그마루 제외 키워드 관리

#### 내보내기 (시트 → DB 동기화)
1. 원하는 시트 탭 선택 (패키지 또는 도그마루 제외)
2. "내보내기" 버튼 클릭
3. Google Sheets 데이터가 MongoDB로 동기화됨
4. 성공 메시지: "DB 동기화 완료! (삭제: X, 삽입: Y)"

#### 노출현황 불러오기 (DB → 시트 동기화)
1. "노출현황 불러오기" 버튼 클릭
2. MongoDB의 `visibility` 값이 시트의 "노출여부" 컬럼에 반영됨
   - `true` → "O"
   - `false` → "" (빈칸)
3. 성공 메시지: "완료! X개 셀 업데이트됨"

**매칭 로직:**
- `회사명 + 키워드 + 인기주제 + URL` 4개 필드로 정확히 매칭
- 같은 회사명+키워드라도 인기주제나 URL이 다르면 별도 항목으로 처리

#### 루트 업체명 적용
1. "루트" 회사명의 키워드를 Root Gunba DB 데이터와 매칭
2. "루트 업체명 적용" 버튼 클릭
3. 매칭된 키워드가 "키워드(업체명)" 형식으로 변경됨
   - 예: "청주맛집" → "청주맛집(아키아키)"

#### 루트 업체명 제거
1. "루트 업체명 제거" 버튼 클릭
2. "(업체명)" 부분이 제거됨
   - 예: "청주맛집(아키아키)" → "청주맛집"

### 2. Root Gunba 페이지 (`/root-gunba`)

#### DB 동기화
1. "DB 동기화" 버튼 클릭
2. Root Gunba 시트 데이터가 RootKeyword 컬렉션으로 동기화됨
3. 키워드가 "키워드(업체명)" 형식으로 저장됨

#### 테이블 기능
- **회사명 상속**: 빈 셀은 위 행의 회사명을 자동으로 상속
- **자동 헤더 감지**: 빈 행이 있어도 자동으로 헤더 행 찾기
- **셀 편집**: 셀 더블클릭하여 직접 수정 가능

### 3. 시트 뷰어 (`/sheets/[sheetId]`)

1. 메인 페이지에서 URL 컬럼의 링크 클릭
2. 해당 Google Sheet 데이터를 읽기 전용으로 표시
3. "Root Gunba" 버튼으로 Root Gunba 페이지 이동 가능

---

## 워크플로우 예시

### 전체 작업 흐름

```
1. Google Sheets에서 키워드 입력/수정
   ↓
2. 메인 페이지에서 "내보내기" 클릭 (시트 → DB)
   ↓
3. Cron bot이 MongoDB의 visibility 필드 업데이트 (외부 프로세스)
   ↓
4. 메인 페이지에서 "노출현황 불러오기" 클릭 (DB → 시트)
   ↓
5. Google Sheets의 "노출여부" 컬럼이 자동으로 업데이트됨
```

### Root 키워드 작업 흐름

```
1. Root Gunba 시트에 "키워드(업체명)" 형식으로 입력
   ↓
2. Root Gunba 페이지에서 "DB 동기화" 클릭
   ↓
3. 메인 페이지(패키지)에서 "루트 업체명 적용" 클릭
   ↓
4. "루트" 회사의 키워드들이 "(업체명)" 형식으로 변경됨
```

---

## 문제 해결

### 1. 포트 3000이 이미 사용 중입니다

**증상:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결방법:**

Mac:
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

Windows:
```cmd
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F
pnpm dev
```

### 2. MongoDB 연결 오류

**증상:**
```
MongoServerError: Authentication failed
```

**해결방법:**
1. `.env.local` 파일의 `MONGODB_URI` 확인
2. 비밀번호에 특수문자가 있으면 URL 인코딩 필요
   - `@` → `%40`
   - `#` → `%23`
   - `&` → `%26`
3. MongoDB Atlas IP 허용 목록 확인

### 3. Google Sheets API 오류

**증상:**
```
Error: ENOENT: no such file or directory, open 'credentials.json'
```

**해결방법:**
1. `credentials.json` 파일이 프로젝트 루트에 있는지 확인
2. `.env.local`의 `GOOGLE_APPLICATION_CREDENTIALS` 경로 확인
3. Google Cloud Console에서 Google Sheets API가 활성화되어 있는지 확인

### 4. pnpm install 오류

**증상:**
```
EACCES: permission denied
```

**해결방법:**

Mac:
```bash
sudo chown -R $USER ~/.pnpm-store
pnpm install
```

Windows (관리자 권한으로 명령 프롬프트 실행):
```cmd
pnpm install
```

### 5. Node.js 버전 오류

**증상:**
```
The engine "node" is incompatible with this module
```

**해결방법:**
```bash
node --version
```
Node.js 18.17 이상 필요. 낮은 버전이면:

Mac:
```bash
brew upgrade node
```

Windows:
- https://nodejs.org에서 최신 LTS 버전 다운로드 및 재설치

### 6. Build 오류

**증상:**
```
Module not found: Can't resolve 'child_process'
```

**해결방법:**
- 이미 수정됨 (parser 함수들을 서버 전용으로 분리)
- 최신 코드인지 확인:
```bash
git pull origin main
pnpm install
pnpm build
```

---

## 추가 참고사항

### 데이터베이스 구조

#### Keyword Collection
- `company`: 회사명
- `keyword`: 키워드
- `popularTopic`: 인기주제
- `url`: URL
- `visibility`: 노출여부 (boolean)
- `sheetType`: "package" 또는 "dogmaru-exclude"
- `matchedHtml`, `matchedTitle`, `restaurantName`, `matchedPosition`: 매칭 정보

#### RootKeyword Collection
- `company`: 업체명
- `keyword`: "키워드(업체명)" 형식
- `visibility`: 노출여부 (boolean)
- `url`: URL

### 중요 파일들

- `.env.local`: 환경 변수 (Git에 포함되지 않음)
- `credentials.json`: Google API 인증 정보 (Git에 포함되지 않음)
- `pnpm-lock.yaml`: 패키지 버전 고정
- `next.config.ts`: Next.js 설정

---

## 연락처 및 지원

문제가 해결되지 않으면:

1. GitHub Issues에 문제 등록
2. 에러 메시지 전체 복사하여 첨부
3. 실행 환경 정보 포함 (OS, Node 버전 등)

---

**마지막 업데이트**: 2025-01-12
