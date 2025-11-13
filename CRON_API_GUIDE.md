# Cron API 통합 가이드

## 개요

이 문서는 크롤러 프로젝트에서 Google Sheet 앱의 동기화 API를 자동으로 호출하는 방법을 설명합니다.

## 워크플로우

```
1. 전체 데이터 DB로 내보내기 (Sheet → DB)
   ↓
2. 데이터 DB 순회하며 크롤링 + 노출 체크 → DB 업데이트 (크롤러 프로젝트)
   ↓
3. 적용된 노출 현황 전체 적용 (DB → Sheet)
```

## API 엔드포인트

### 1. 전체 데이터 DB로 내보내기

**Endpoint:** `GET http://localhost:3000/api/cron/sync-all`

**설명:**
- 패키지, 도그마루, 도그마루 제외 시트의 모든 데이터를 DB로 동기화합니다
- 기존 데이터를 삭제하고 새로운 데이터를 삽입합니다

**응답 예시:**
```json
{
  "success": true,
  "results": {
    "package": {
      "deleted": 100,
      "inserted": 120
    },
    "dogmaru": {
      "deleted": 50,
      "inserted": 55
    },
    "dogmaruExclude": {
      "deleted": 30,
      "inserted": 35
    }
  },
  "totals": {
    "deleted": 180,
    "inserted": 210
  }
}
```

### 2. 적용된 노출 현황 전체 적용

**Endpoint:** `GET http://localhost:3000/api/cron/import-all`

**설명:**
- DB에서 노출 여부(visibility)를 읽어 시트에 적용합니다
- 패키지, 도그마루, 도그마루 제외 시트 모두 업데이트합니다

**응답 예시:**
```json
{
  "success": true,
  "updated": 210,
  "results": [
    {
      "title": "패키지",
      "updatedCells": 120,
      "rowUpdates": 120
    },
    {
      "title": "도그마루",
      "updatedCells": 55,
      "rowUpdates": 55
    },
    {
      "title": "도그마루 제외",
      "updatedCells": 35,
      "rowUpdates": 35
    }
  ]
}
```

## 크롤러 프로젝트에서 구현 예시

### Node.js + node-cron

```typescript
import cron from 'node-cron';
import axios from 'axios';

const SHEET_APP_URL = 'http://localhost:3000';

// 매일 오전 8시에 실행
cron.schedule('0 8 * * *', async () => {
  console.log('🕐 [CRON] 자동 동기화 시작:', new Date().toISOString());

  try {
    // 1. 전체 데이터 DB로 내보내기
    console.log('📤 [Step 1] 전체 데이터 DB로 내보내기...');
    const syncResponse = await axios.get(`${SHEET_APP_URL}/api/cron/sync-all`);
    console.log('✅ [Step 1] 완료:', syncResponse.data);

    // 2. 크롤링 + 노출 체크 (여기에 크롤러 로직 구현)
    console.log('🔍 [Step 2] 크롤링 및 노출 체크 시작...');
    await performCrawlingAndVisibilityCheck();
    console.log('✅ [Step 2] 완료');

    // 3. 적용된 노출 현황 전체 적용
    console.log('📥 [Step 3] 노출 현황 시트에 적용...');
    const importResponse = await axios.get(`${SHEET_APP_URL}/api/cron/import-all`);
    console.log('✅ [Step 3] 완료:', importResponse.data);

    console.log('✅ [CRON] 전체 워크플로우 완료!');
  } catch (error) {
    console.error('❌ [CRON] 에러 발생:', error);
  }
}, {
  timezone: 'Asia/Seoul'
});

async function performCrawlingAndVisibilityCheck() {
  // TODO: 크롤러 로직 구현
  // 1. DB에서 키워드 가져오기
  // 2. 각 키워드에 대해 크롤링 수행
  // 3. 노출 여부 확인
  // 4. DB 업데이트
}
```

### Python + schedule

```python
import schedule
import time
import requests
from datetime import datetime

SHEET_APP_URL = 'http://localhost:3000'

def sync_job():
    print(f'🕐 [CRON] 자동 동기화 시작: {datetime.now().isoformat()}')

    try:
        # 1. 전체 데이터 DB로 내보내기
        print('📤 [Step 1] 전체 데이터 DB로 내보내기...')
        sync_response = requests.get(f'{SHEET_APP_URL}/api/cron/sync-all')
        print(f'✅ [Step 1] 완료: {sync_response.json()}')

        # 2. 크롤링 + 노출 체크
        print('🔍 [Step 2] 크롤링 및 노출 체크 시작...')
        perform_crawling_and_visibility_check()
        print('✅ [Step 2] 완료')

        # 3. 적용된 노출 현황 전체 적용
        print('📥 [Step 3] 노출 현황 시트에 적용...')
        import_response = requests.get(f'{SHEET_APP_URL}/api/cron/import-all')
        print(f'✅ [Step 3] 완료: {import_response.json()}')

        print('✅ [CRON] 전체 워크플로우 완료!')
    except Exception as e:
        print(f'❌ [CRON] 에러 발생: {e}')

def perform_crawling_and_visibility_check():
    # TODO: 크롤러 로직 구현
    pass

# 매일 오전 8시에 실행
schedule.every().day.at("08:00").do(sync_job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## 환경 변수 설정

크롤러 프로젝트에서 다음 환경 변수를 설정하세요:

```bash
# .env
SHEET_APP_URL=http://localhost:3000  # 개발 환경
# SHEET_APP_URL=https://your-production-url.com  # 프로덕션 환경
```

## 수동 테스트

개발 중에는 다음 명령어로 수동 테스트할 수 있습니다:

```bash
# 1. 전체 데이터 DB로 내보내기
curl http://localhost:3000/api/cron/sync-all

# 2. 노출 현황 전체 적용
curl http://localhost:3000/api/cron/import-all
```

## 주의사항

1. **순서 중요**: 반드시 `sync-all` → 크롤링 → `import-all` 순서로 실행해야 합니다
2. **타임아웃**: 대용량 데이터의 경우 API 호출 시 타임아웃을 충분히 설정하세요
3. **에러 핸들링**: 각 단계에서 에러 발생 시 적절한 로깅 및 알림을 구현하세요
4. **동시 실행 방지**: 여러 cron job이 동시에 실행되지 않도록 lock 메커니즘을 구현하세요

## 로그 확인

각 API는 콘솔에 상세한 로그를 출력합니다:

- `🔥 [CRON]` - Cron job 시작/완료
- `✅` - 성공
- `❌` - 에러

서버 로그를 확인하여 동기화 상태를 모니터링할 수 있습니다.
