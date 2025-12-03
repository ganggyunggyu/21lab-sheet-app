import { NextRequest, NextResponse } from 'next/server';
import { getAllKeywords } from '@/entities/keyword';
import {
  type SheetRow,
  type SheetUpdate,
  buildLatestKeywordMap,
  getColumnLetter,
  normalize,
  findColumnIndexes,
  ensureRequiredColumns,
  IMPORT_SHEET_HEADERS,
  mapKeywordToRow,
} from '@/entities/keyword/lib';
import {
  getSheetData,
  batchUpdateSheetData,
  getSpreadsheetMetadata,
  clearColsAtoG,
} from '@/lib/google-sheets';
import { getKeywordBySheetType } from '@/entities/keyword/api/api';

const buildVisibilityUpdatesByMap = (params: {
  title: string;
  sheetData: SheetRow[];
  latestMap: Map<string, any>;
  companyColumnIndex: number;
  keywordColumnIndex: number;
  popularTopicColumnIndex: number;
  urlColumnIndex: number;
}) => {
  const {
    title,
    sheetData,
    latestMap,
    companyColumnIndex,
    keywordColumnIndex,
    popularTopicColumnIndex,
    urlColumnIndex,
  } = params;

  const headers = sheetData[0] || [];
  const visibilityColumnIndex = headers.findIndex((header) => {
    const h = normalize(header);
    return h.includes('노출여부') || h.includes('노출');
  });

  if (visibilityColumnIndex === -1) {
    return {
      updates: [] as SheetUpdate[],
      appliedLogs: [] as { row: number; keyword: string; value: string }[],
      matchedCount: 0,
      updatedCells: 0,
      skipped: true as const,
      reason: '필요 컬럼 없음',
    };
  }

  const visibilityColumn = getColumnLetter(visibilityColumnIndex);
  const updates: SheetUpdate[] = [];
  const appliedLogs: Array<{ row: number; keyword: string; value: string }> =
    [];

  let currentCompany = '';
  let matchedCount = 0;

  sheetData.slice(1).forEach((row, idx) => {
    if (row[companyColumnIndex]) {
      currentCompany = row[companyColumnIndex];
    }

    const keyword = row[keywordColumnIndex];
    const popularTopic =
      popularTopicColumnIndex !== -1 ? row[popularTopicColumnIndex] || '' : '';
    const url = urlColumnIndex !== -1 ? row[urlColumnIndex] || '' : '';

    if (!keyword || !currentCompany) return;

    const mapKey = `${currentCompany || ''}||${keyword || ''}||${
      popularTopic || ''
    }||${url || ''}`;

    const dbKeyword = latestMap.get(mapKey);

    if (!dbKeyword) return;

    matchedCount++;

    const visibilityValue = dbKeyword.visibility ? 'o' : '';
    const rowNumber = idx + 2;

    updates.push({
      range: `${visibilityColumn}${rowNumber}`,
      values: [[visibilityValue]],
    });
    appliedLogs.push({ row: rowNumber, keyword, value: visibilityValue });
  });

  return {
    updates,
    appliedLogs,
    matchedCount,
    updatedCells: 0,
    skipped: false as const,
    reason: undefined as string | undefined,
  };
};

const processOneSheetWithMap = async (params: {
  sheetId: string;
  title: string;
  latestMap: Map<string, any>;
}) => {
  const { sheetId, title, latestMap } = params;
  const sheetData = await getSheetData(sheetId, title);

  if (!sheetData || sheetData.length === 0) {
    return {
      title,
      matched: 0,
      updatedCells: 0,
      skipped: true as const,
      reason: '시트 데이터 없음',
    };
  }

  const headers = sheetData[0] || [];
  const {
    companyColumnIndex,
    keywordColumnIndex,
    popularTopicColumnIndex,
    urlColumnIndex,
  } = findColumnIndexes(headers);

  const requiredCheck = ensureRequiredColumns(title, {
    companyColumnIndex,
    keywordColumnIndex,
    visibilityColumnIndex: headers.findIndex((header) => {
      const h = normalize(header);
      return h.includes('노출여부') || h.includes('노출');
    }),
  });

  if (requiredCheck) {
    return requiredCheck;
  }

  const { updates, matchedCount, skipped, reason } =
    buildVisibilityUpdatesByMap({
      title,
      sheetData,
      latestMap,
      companyColumnIndex: companyColumnIndex!,
      keywordColumnIndex,
      popularTopicColumnIndex,
      urlColumnIndex,
    });

  let updatedCells = 0;

  if (!skipped && updates.length > 0) {
    const res = await batchUpdateSheetData(sheetId, updates, title);
    updatedCells = (res.totalUpdatedCells as number) || updates.length;
  }

  return { title, matched: matchedCount, updatedCells, skipped, reason };
};

const validateFirstKeywordSync = (params: {
  title: string;
  sheetData: SheetRow[];
  dbKeywords: any[];
  dbIndex: number;
  keywordColumnIndex: number;
}) => {
  const { title, sheetData, dbKeywords, dbIndex, keywordColumnIndex } = params;

  const firstDataRow = (sheetData
    .slice(1)
    .find((r) => r && r[keywordColumnIndex]) || []) as string[];

  const firstSheetKeyword = (firstDataRow[keywordColumnIndex] || '').trim();
  const expectedDb = dbKeywords[dbIndex];
  const expectedDbKeyword = (expectedDb?.keyword || '').trim();

  const isMismatch =
    !expectedDbKeyword || firstSheetKeyword !== expectedDbKeyword;

  return {
    isMismatch,
    firstSheetKeyword,
    expectedDbKeyword,
  };
};

const buildUpdatesSequentialByDb = (params: {
  title: string;
  sheetData: SheetRow[];
  dbKeywords: any[];
  dbIndex: { value: number };
  keywordColumnIndex: number;
  visibilityColumnIndex: number;
}) => {
  const {
    title,
    sheetData,
    dbKeywords,
    dbIndex,
    keywordColumnIndex,
    visibilityColumnIndex,
  } = params;

  const updates: SheetUpdate[] = [];
  const appliedLogs: Array<{ row: number; keyword: string; value: string }> =
    [];
  const visibilityColumn = getColumnLetter(visibilityColumnIndex);

  let localRows = 0;

  sheetData.slice(1).forEach((row, idx) => {
    const keyword = row[keywordColumnIndex];
    if (!keyword) return;
    if (dbIndex.value >= dbKeywords.length) return;

    const dbKw = dbKeywords[dbIndex.value++];
    const visibilityValue = dbKw.visibility ? 'o' : '';

    if (dbKw.keyword !== keyword) {
      // 여기서 mismatch 로그 남기고 싶으면 사용
      console.warn(
        `[${title}] 키워드 불일치: DB="${dbKw.keyword}", SHEET="${keyword}"`
      );
    }

    const rowNumber = idx + 2;
    updates.push({
      range: `${visibilityColumn}${rowNumber}`,
      values: [[visibilityValue]],
    });
    appliedLogs.push({ row: rowNumber, keyword, value: visibilityValue });
    localRows++;
  });

  return { updates, appliedLogs, localRows };
};

const processAllSheetsSequential = async (params: {
  sheetId: string;
  dbKeywords: any[];
}) => {
  const { sheetId, dbKeywords } = params;

  const metadata = await getSpreadsheetMetadata(sheetId);

  const orderedTitles = metadata
    .filter((sheet: { title: string; sheetId: number }) =>
      sheet.title.includes('노출체크 프로그램')
    )
    .sort(
      (
        a: { title: string; sheetId: number },
        b: { title: string; sheetId: number }
      ) => a.sheetId - b.sheetId
    )
    .map((sheet: { title: string; sheetId: number }) => sheet.title);

  const dbIndexRef = { value: 0 };
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
    const { keywordColumnIndex } = findColumnIndexes(headers);

    const visibilityColumnIndex = headers.findIndex((header) => {
      const h = normalize(header);
      return h.includes('노출여부') || h.includes('노출');
    });

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

    const { isMismatch, firstSheetKeyword, expectedDbKeyword } =
      validateFirstKeywordSync({
        title,
        sheetData,
        dbKeywords,
        dbIndex: dbIndexRef.value,
        keywordColumnIndex,
      });

    if (isMismatch) {
      return {
        errorResponse: NextResponse.json(
          {
            error: '첫 키워드 불일치 (순서 동기화 필요)',
            sheet: title,
            expected: expectedDbKeyword,
            actual: firstSheetKeyword,
            hint: '패키지 → 도그마루 제외 순으로 DB 동기화 후 다시 시도하세요',
          },
          { status: 400 }
        ),
        results: null,
      } as const;
    }

    const { updates, localRows } = buildUpdatesSequentialByDb({
      title,
      sheetData,
      dbKeywords,
      dbIndex: dbIndexRef,
      keywordColumnIndex,
      visibilityColumnIndex,
    });

    let updatedCells = 0;
    if (updates.length > 0) {
      const res = await batchUpdateSheetData(sheetId, updates, title);
      updatedCells = (res.totalUpdatedCells as number) || updates.length;
    }

    results.push({ title, updatedCells, rowUpdates: localRows });
  }

  const totalUpdated = results.reduce(
    (acc, r) => acc + (r.updatedCells || 0),
    0
  );

  return {
    errorResponse: null as NextResponse | null,
    results,
    totalUpdated,
  };
};

// 🔥 새로운 테스트 로직: DB 데이터 전체를 시트에 재작성
const processFullRewrite = async (params: {
  sheetId: string;
  sheetName: string;
  sheetType: string;
}) => {
  const { sheetId, sheetName, sheetType } = params;

  const dbKeywords = await getKeywordBySheetType(sheetType);

  if (dbKeywords.length === 0) {
    return {
      title: sheetName,
      totalRows: 0,
      updatedCells: 0,
      message: 'DB에 데이터가 없습니다',
    };
  }

  const headers = [IMPORT_SHEET_HEADERS];
  const dataRows = dbKeywords.map(mapKeywordToRow);

  const allRows = [...headers, ...dataRows];

  // 시트 전체 재작성 (A1부터 시작)
  const range = `A1`;
  const updates: SheetUpdate[] = [
    {
      range,
      values: allRows,
    },
  ];

  const res = await batchUpdateSheetData(sheetId, updates, sheetName);
  const updatedCells = (res.totalUpdatedCells as number) || allRows.length * 3;

  return {
    title: sheetName,
    totalRows: dbKeywords.length,
    updatedCells,
    message: '전체 재작성 완료',
  };
};

export async function POST(request: NextRequest) {
  try {
    const {
      sheetId,
      sheetName,
      mode = 'update',
      sheetType,
    } = await request.json();

    const isAll = String(sheetName).toLowerCase() === 'all';

    // 🔥 테스트 모드: 전체 재작성
    if (mode === 'rewrite') {
      await clearColsAtoG({
        spreadsheetId: sheetId,
        sheetName: sheetName,
      });

      const result = await processFullRewrite({
        sheetId,
        sheetName,
        sheetType,
      });
      return NextResponse.json({
        success: true,
        mode: 'rewrite',
        ...result,
      });
    }

    // 기존 로직: 노출여부만 업데이트
    const dbKeywords = await getAllKeywords();
    const latestMap = buildLatestKeywordMap(dbKeywords);

    if (isAll) {
      const { errorResponse, results, totalUpdated } =
        await processAllSheetsSequential({
          sheetId,
          dbKeywords,
        });

      if (errorResponse) {
        return errorResponse;
      }

      return NextResponse.json({
        success: true,
        mode: 'update',
        updated: totalUpdated,
        results,
      });
    }

    const res = await processOneSheetWithMap({
      sheetId,
      title: sheetName,
      latestMap,
    });

    return NextResponse.json({
      success: true,
      mode: 'update',
      updated: res.updatedCells,
      results: [res],
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
