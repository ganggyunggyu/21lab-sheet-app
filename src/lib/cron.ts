import { parseSheetData } from '@/entities/keyword/api/parser';
import { replaceAllKeywords } from '@/entities/keyword';

const SHEET_ID = '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0';
const SHEET_NAMES = {
  PACKAGE: '패키지',
  DOGMARU: '도그마루',
  DOGMARU_EXCLUDE: '도그마루 제외',
} as const;

export async function syncAllSheets() {
  try {
    console.log('🔥 [CRON] 전체 시트 동기화 시작:', new Date().toISOString());

    const packageKeywords = await parseSheetData(
      SHEET_ID,
      SHEET_NAMES.PACKAGE,
      'package'
    );
    const packageResult = await replaceAllKeywords(packageKeywords, 'package');
    console.log('✅ [CRON] 패키지 동기화 완료:', packageResult);

    const dogmaruKeywords = await parseSheetData(
      SHEET_ID,
      SHEET_NAMES.DOGMARU,
      'dogmaru'
    );
    const dogmaruResult = await replaceAllKeywords(dogmaruKeywords, 'dogmaru');
    console.log('✅ [CRON] 도그마루 동기화 완료:', dogmaruResult);

    const dogmaruExcludeKeywords = await parseSheetData(
      SHEET_ID,
      SHEET_NAMES.DOGMARU_EXCLUDE,
      'dogmaru-exclude'
    );
    const dogmaruExcludeResult = await replaceAllKeywords(dogmaruExcludeKeywords, 'dogmaru-exclude');
    console.log('✅ [CRON] 도그마루 제외 동기화 완료:', dogmaruExcludeResult);

    const totalDeleted =
      packageResult.deleted +
      dogmaruResult.deleted +
      dogmaruExcludeResult.deleted;
    const totalInserted =
      packageResult.inserted +
      dogmaruResult.inserted +
      dogmaruExcludeResult.inserted;

    console.log('✅ [CRON] 전체 동기화 완료!');
    console.log(`   - 패키지: ${packageResult.inserted}개`);
    console.log(`   - 도그마루: ${dogmaruResult.inserted}개`);
    console.log(`   - 도그마루 제외: ${dogmaruExcludeResult.inserted}개`);
    console.log(`   - 총 삭제: ${totalDeleted}, 총 삽입: ${totalInserted}`);
    console.log('🔥 [CRON] 완료 시간:', new Date().toISOString());

    return {
      success: true,
      results: {
        package: packageResult,
        dogmaru: dogmaruResult,
        dogmaruExclude: dogmaruExcludeResult,
      },
      totals: {
        deleted: totalDeleted,
        inserted: totalInserted,
      },
    };
  } catch (error) {
    console.error('❌ [CRON] 전체 동기화 에러:', error);
    throw error;
  }
}
