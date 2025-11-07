# Google Sheets Manager

구글 시트 연동해서 데이터 관리하는 대시보드 ㄱㄱ

## 세팅 방법

### 1. Google Cloud 서비스 계정 만들기

1. [Google Cloud Console](https://console.cloud.google.com/)로 고고
2. 프로젝트 만들고
3. "API 및 서비스" > "라이브러리" > "Google Sheets API" 활성화
4. "API 및 서비스" > "사용자 인증 정보" > "서비스 계정 만들기"
5. 서비스 계정 만든 후 > "키 추가" > "새 키 만들기" > JSON 선택
6. JSON 파일 다운로드됨

### 2. 환경변수 설정

다운받은 JSON 파일 열어서:

```bash
# .env.local 파일에 아래 내용 입력
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

⚠️ **주의**: `GOOGLE_PRIVATE_KEY`는 JSON의 `private_key` 필드 그대로 복사붙여넣기 (줄바꿈 `\n` 포함)

### 3. 구글 시트 권한 설정

1. 사용할 구글 시트 열기
2. "공유" 버튼 클릭
3. 서비스 계정 이메일 추가 (위의 `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. 권한: "편집자" 선택

### 4. 시트 ID 확인

구글 시트 URL에서 ID 복사:
```
https://docs.google.com/spreadsheets/d/[여기가_시트_ID]/edit
```

## 실행

```bash
pnpm install
pnpm dev
```

http://localhost:3000 접속해서 시트 ID 입력하고 연결하면 끝!

## 기능

- ✅ 시트 데이터 실시간 조회
- ✅ 셀 클릭해서 직접 수정
- ✅ 새 행 추가
- ✅ 쌈뽕한 그라디언트 UI

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- TanStack Query (서버 상태 관리)
- Tailwind CSS 4
- googleapis
