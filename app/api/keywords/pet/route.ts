import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsByCompanies } from '@/entities/keyword/api/api';
import {
  IMPORT_SHEET_HEADERS,
  mapKeywordToRow,
} from '@/entities/keyword/lib';
import { batchUpdateSheetData, clearColsAtoG } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { sheetId, sheetName } = await request.json();

    if (!sheetId || !sheetName) {
      return NextResponse.json(
        { error: 'sheetId와 sheetName이 필요합니다' },
        { status: 400 }
      );
    }

    await clearColsAtoG({
      spreadsheetId: sheetId,
      sheetName: sheetName,
    });

    const dbKeywords = await getKeywordsByCompanies(['서리펫', '도그마루']);

    if (dbKeywords.length === 0) {
      return NextResponse.json({
        success: true,
        title: sheetName,
        totalRows: 0,
        message: 'DB에 애견 데이터가 없습니다',
      });
    }

    const headers = [IMPORT_SHEET_HEADERS];
    const dataRows = dbKeywords.map(mapKeywordToRow);
    const allRows = [...headers, ...dataRows];

    const updates = [
      {
        range: 'A1',
        values: allRows,
      },
    ];

    const res = await batchUpdateSheetData(sheetId, updates, sheetName);
    const updatedCells = (res.totalUpdatedCells as number) || allRows.length * 7;

    return NextResponse.json({
      success: true,
      title: sheetName,
      totalRows: dbKeywords.length,
      updatedCells,
      message: '애견 내보내기 완료',
    });
  } catch (error) {
    console.error('애견 내보내기 에러:', error);
    return NextResponse.json(
      {
        error: '서버 에러가 발생했습니다',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
