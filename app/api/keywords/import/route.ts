import { NextRequest, NextResponse } from 'next/server';
import { getAllKeywords } from '@/entities/keyword';
import {
  getSheetData,
  batchUpdateSheetData,
  getSpreadsheetMetadata,
} from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { sheetId, sheetName, sheetType } = await request.json();

    if (!sheetId || !sheetName) {
      return NextResponse.json(
        { error: 'sheetId, sheetName이 필요합니다' },
        { status: 400 }
      );
    }

    console.log('🔥 DB → 시트 노출여부 불러오기 시작:', {
      sheetId,
      sheetName,
      sheetType,
    });

    const dbKeywords = await getAllKeywords(); // sheetType 무시, 생성순 정렬
    console.log('🔥 DB 키워드 개수(전체):', dbKeywords.length);

    // 동일 키(company, keyword, popularTopic, url) 중 최신(updatedAt) 1건만 사용
    const toKey = (kw: any) => {
      const company = kw.company || '';
      const keyword = kw.keyword || '';
      const popularTopic = kw.popularTopic || '';
      const url = kw.url || '';
      return `${company}||${keyword}||${popularTopic}||${url}`;
    };

    const latestMap = new Map<string, any>();
    for (const kw of dbKeywords) {
      const key = toKey(kw);
      const prev = latestMap.get(key);
      if (!prev) {
        latestMap.set(key, kw);
        continue;
      }
      const prevTime = new Date(
        prev.updatedAt || prev.createdAt || prev.lastChecked || 0
      ).getTime();
      const curTime = new Date(
        kw.updatedAt || kw.createdAt || kw.lastChecked || 0
      ).getTime();
      if (
        curTime > prevTime ||
        (curTime === prevTime && String(kw._id) > String(prev._id))
      ) {
        latestMap.set(key, kw);
      }
    }

    // 헬퍼: 단일 시트 처리 (테스트 모드: 시트 업데이트는 주석 상태 유지)
    const processOneSheet = async (title: string) => {
      const sheetData = await getSheetData(sheetId, title);

      if (!sheetData || sheetData.length === 0) {
        return { title, matched: 0, skipped: true, reason: '시트 데이터 없음' };
      }

      const headers = sheetData[0] || [];
      const companyColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '회사명' ||
          header?.toLowerCase() === 'name' ||
          header?.toLowerCase() === '업체'
      );
      const keywordColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '키워드' ||
          header?.toLowerCase() === 'keyword'
      );
      const popularTopicColumnIndex = headers.findIndex((header) =>
        header?.toLowerCase().includes('인기주제')
      );
      const visibilityColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase().includes('노출여부') ||
          header?.toLowerCase().includes('노출')
      );

      if (
        companyColumnIndex === -1 ||
        keywordColumnIndex === -1 ||
        visibilityColumnIndex === -1
      ) {
        return { title, matched: 0, skipped: true, reason: '필요 컬럼 없음' };
      }

      console.log(`🔥 [${title}] 컬럼 인덱스:`, {
        companyColumnIndex,
        keywordColumnIndex,
        popularTopicColumnIndex,
        visibilityColumnIndex,
      });

      const updates: Array<{ range: string; values: string[][] }> = [];
      let currentCompany = '';
      let matchedCount = 0;

      console.log(`🔥 [${title}] 매칭 시작...`);

      sheetData.slice(1).forEach((row, idx) => {
        if (row[companyColumnIndex]) {
          currentCompany = row[companyColumnIndex];
        }

        const keyword = row[keywordColumnIndex];
        const popularTopic =
          popularTopicColumnIndex !== -1
            ? row[popularTopicColumnIndex] || ''
            : '';
        const url =
          headers.findIndex((h) => h?.toLowerCase() === 'url') !== -1
            ? row[headers.findIndex((h) => h?.toLowerCase() === 'url')] || ''
            : '';

        if (!keyword || !currentCompany) return;

        const mapKey = `${currentCompany || ''}||${keyword || ''}||${
          popularTopic || ''
        }||${url || ''}`;
        const dbKeyword = latestMap.get(mapKey);

        if (dbKeyword) {
          matchedCount++;
          const visibilityValue = dbKeyword.visibility ? 'o' : '';
          // 콘솔 표기만 ❌ 허용 (시트에는 공백 기록)
          const visibilityText = dbKeyword.visibility
            ? '노출(o)'
            : '미노출(❌)';

          console.log(
            `  ✅ [${matchedCount}] 행 ${
              idx + 2
            }: "${currentCompany} - ${keyword}" → ${visibilityText} (id: ${String(
              dbKeyword._id
            )})`
          );

          /* 시트 업데이트 주석처리 - 테스트용
          const getColumnLetter = (colIndex: number): string => {
            let letter = '';
            let temp = colIndex + 1;
            while (temp > 0) {
              const remainder = (temp - 1) % 26;
              letter = String.fromCharCode(65 + remainder) + letter;
              temp = Math.floor((temp - 1) / 26);
            }
            return letter;
          };

          const visibilityColumn = getColumnLetter(visibilityColumnIndex);
          const rowNumber = idx + 2;
          updates.push({ range: `${visibilityColumn}${rowNumber}`, values: [[visibilityValue]] });
          */
        }
      });

      console.log(`🔥 [${title}] 매칭 완료!`);
      console.log(`🔥 [${title}] 총 매칭된 키워드 수:`, matchedCount);

      /* 시트 업데이트 주석처리 - 테스트용
      if (updates.length > 0) {
        await batchUpdateSheetData(sheetId, updates, title);
        console.log(`✅ [${title}] 시트 업데이트 완료!`);
      }
      */

      return { title, matched: matchedCount, skipped: false };
    };

    const isAll = String(sheetName).toLowerCase() === 'all';
    if (isAll) {
      // 패키지 → 도그마루 제외 순으로 DB를 순차 소비하여 1:1로 노출여부를 기록
      const orderedTitles = ['패키지', '도그마루 제외'];
      const getColumnLetter = (colIndex: number): string => {
        let letter = '';
        let temp = colIndex + 1;
        while (temp > 0) {
          const remainder = (temp - 1) % 26;
          letter = String.fromCharCode(65 + remainder) + letter;
          temp = Math.floor((temp - 1) / 26);
        }
        return letter;
      };

      let dbIndex = 0;
      const results: Array<{
        title: string;
        updatedCells: number;
        rowUpdates: number;
        skipped?: boolean;
        reason?: string;
      }> = [];

      for (const title of orderedTitles) {
        const sheetData = await getSheetData(sheetId, title);
        if (!sheetData || sheetData.length === 0) {
          results.push({
            title,
            updatedCells: 0,
            rowUpdates: 0,
            skipped: true,
            reason: '시트 데이터 없음',
          });
          continue;
        }

        const headers = sheetData[0] || [];
        const keywordColumnIndex = headers.findIndex(
          (h) => h?.toLowerCase() === '키워드' || h?.toLowerCase() === 'keyword'
        );
        const visibilityColumnIndex = headers.findIndex(
          (h) =>
            h?.toLowerCase().includes('노출여부') ||
            h?.toLowerCase().includes('노출')
        );

        if (keywordColumnIndex === -1 || visibilityColumnIndex === -1) {
          results.push({
            title,
            updatedCells: 0,
            rowUpdates: 0,
            skipped: true,
            reason: '필요 컬럼 없음',
          });
          continue;
        }

        // 0번 인덱스 검증: 현재 DB 인덱스의 키워드와 시트 첫 데이터 행 키워드가 동일해야 함
        const firstDataRow = (sheetData
          .slice(1)
          .find((r) => r && r[keywordColumnIndex]) || []) as string[];
        const firstSheetKeyword = (
          firstDataRow[keywordColumnIndex] || ''
        ).trim();
        const expectedDb = dbKeywords[dbIndex];
        const expectedDbKeyword = (expectedDb?.keyword || '').trim();

        if (!expectedDbKeyword || firstSheetKeyword !== expectedDbKeyword) {
          return NextResponse.json(
            {
              error: '첫 키워드 불일치 (순서 동기화 필요)',
              sheet: title,
              expected: expectedDbKeyword,
              actual: firstSheetKeyword,
              hint: '패키지 → 도그마루 제외 순으로 DB 동기화 후 다시 시도하세요',
            },
            { status: 400 }
          );
        }

        const updates: Array<{ range: string; values: string[][] }> = [];
        const appliedLogs: Array<{
          row: number;
          keyword: string;
          value: string;
        }> = [];
        const visibilityColumn = getColumnLetter(visibilityColumnIndex);
        let localRows = 0;

        sheetData.slice(1).forEach((row, idx) => {
          const keyword = row[keywordColumnIndex];
          if (!keyword) return;
          if (dbIndex >= dbKeywords.length) return;

          const dbKw = dbKeywords[dbIndex++];
          const visibilityValue = dbKw.visibility ? 'o' : '';

          // 순차 소비 로그 (불일치 디버깅용)
          if (dbKw.keyword !== keyword) {
            console.log(
              `⚠️ [${title}] 키워드 순서 불일치: 시트="${keyword}" DB="${dbKw.keyword}" (idx=${dbIndex})`
            );
          }

          const rowNumber = idx + 2; // 헤더 제외 + 1-based index
          updates.push({
            range: `${visibilityColumn}${rowNumber}`,
            values: [[visibilityValue]],
          });
          appliedLogs.push({ row: rowNumber, keyword, value: visibilityValue });
          localRows++;
        });

        // 테스트 모드: 시트 미적용, 로그만 출력
        let updatedCells = 0;
        if (updates.length > 0) {
          for (const log of appliedLogs) {
            console.log(
              `  ${log.value ? '✅' : '❌'} [${title}] 행 ${log.row}: "${
                log.keyword
              }" → ${log.value ? 'o' : '(공백)'} 적용(테스트)`
            );
          }
          updatedCells = updates.length;
          console.log(
            `🧪 [${title}] 시뮬레이션 완료: ${updatedCells} cells, rows=${localRows}`
          );
        } else {
          console.log(`ℹ️ [${title}] 업데이트할 행 없음(테스트)`);
        }

        results.push({ title, updatedCells, rowUpdates: localRows });
      }

      const totalUpdated = results.reduce(
        (acc, r) => acc + (r.updatedCells || 0),
        0
      );
      return NextResponse.json({
        success: true,
        updated: totalUpdated,
        results,
      });
    }

    // 단일 시트 처리
    const res = await processOneSheet(sheetName);
    return NextResponse.json({
      success: true,
      updated: res.matched,
      message: '테스트 완료 (콘솔 확인)',
    });
  } catch (error) {
    console.error('노출여부 불러오기 에러:', error);
    return NextResponse.json(
      {
        error: '서버 에러가 발생했습니다',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
