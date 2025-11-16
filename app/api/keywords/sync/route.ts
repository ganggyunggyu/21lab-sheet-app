import { NextRequest, NextResponse } from 'next/server';
import { replaceAllKeywords } from '@/entities/keyword';
import { parseSheetData } from '@/entities/keyword/api/parser';

export async function POST(request: NextRequest) {
  try {
    const { sheetId, sheetName, sheetType } = await request.json();
    const keywords = await parseSheetData(sheetId, sheetName, sheetType);

    const result = await replaceAllKeywords(keywords, sheetType);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      inserted: result.inserted,
    });
  } catch (error) {
    console.error('키워드 동기화 에러:', error);
    return NextResponse.json(
      {
        error: '서버 에러가 발생했습니다',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
