import { NextResponse } from 'next/server';
import { ROOT_IMPORT_CONFIG } from '@/shared/constants/sheet';
import { batchUpdateSheetData, clearColsAtoG } from '@/lib/google-sheets';
import { getAllRootKeywords } from '@/entities/keyword';

type SheetUpdate = { range: string; values: string[][] };

export async function POST() {
  try {
    const { SHEET_ID, SHEET_NAMES } = ROOT_IMPORT_CONFIG;
    const sheetName = SHEET_NAMES.ROOT;

    console.log('[루트 임포트] SHEET_ID:', SHEET_ID);
    console.log('[루트 임포트] sheetName:', sheetName);

    // 1. DB에서 rootKeywords 가져오기
    const dbKeywords = await getAllRootKeywords();
    console.log('[루트 임포트] DB 키워드 개수:', dbKeywords.length);

    if (dbKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        totalRows: 0,
        updatedCells: 0,
        message: 'DB에 데이터가 없습니다',
      });
    }

    // 2. 시트 전체 지우기 (A~I 컬럼)
    await clearColsAtoG({
      spreadsheetId: SHEET_ID,
      sheetName: sheetName,
    });

    // 3. 헤더 + 데이터 행 생성
    const headers = [
      [
        '업체명',
        '키워드',
        '인기주제',
        '순위',
        '노출여부',
        '바이럴 체크',
        '인기글 순위',
        '이미지 매칭',
        '링크',
      ],
    ];

    const dataRows = dbKeywords.map((kw) => [
      kw.company || '',
      kw.keyword || '',
      kw.popularTopic || '',
      kw.rank ? String(kw.rank) : '',
      kw.visibility ? 'o' : '',
      '', // 바이럴 체크 - 빈값
      kw.rankWithCafe ? String(kw.rankWithCafe) : '',
      kw.isUpdateRequired === true ? 'o' : '',
      kw.url || '',
    ]);

    const allRows = [...headers, ...dataRows];

    console.log('[루트 임포트] 전체 행 개수:', allRows.length);
    console.log('[루트 임포트] 첫 3행:', allRows.slice(0, 3));

    // 4. 시트 전체 재작성 (A1부터 시작)
    const updates: SheetUpdate[] = [
      {
        range: 'A1',
        values: allRows,
      },
    ];

    const res = await batchUpdateSheetData(SHEET_ID, updates, sheetName);
    const updatedCells = (res.totalUpdatedCells as number) || allRows.length * 9;

    return NextResponse.json({
      success: true,
      totalRows: dbKeywords.length,
      updated: updatedCells,
      message: `루트 임포트 완료! ${dbKeywords.length}개 행 작성됨`,
    });
  } catch (error) {
    console.error('루트 키워드 노출현황 불러오기 에러:', error);
    return NextResponse.json(
      {
        error: '서버 에러가 발생했습니다',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
