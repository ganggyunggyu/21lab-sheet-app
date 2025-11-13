import { NextRequest, NextResponse } from 'next/server';
import { replaceAllKeywords } from '@/entities/keyword';
import { parseSheetData } from '@/entities/keyword/api/parser';

export async function POST(request: NextRequest) {
  try {
    const { sheetId, sheetName, sheetType } = await request.json();

    if (!sheetId || !sheetName || !sheetType) {
      return NextResponse.json(
        { error: 'sheetId, sheetName, sheetType이 필요합니다' },
        { status: 400 }
      );
    }

    if (!['package', 'dogmaru', 'dogmaru-exclude'].includes(sheetType)) {
      return NextResponse.json(
        { error: 'sheetType은 package | dogmaru | dogmaru-exclude 중 하나여야 합니다' },
        { status: 400 }
      );
    }

    console.log('🔥 동기화 시작:', { sheetId, sheetName, sheetType });

    const keywords = await parseSheetData(sheetId, sheetName, sheetType);

    console.log('🔥 파싱된 키워드 개수:', keywords.length);
    console.log('🔥 파싱된 데이터 샘플:', keywords.slice(0, 2));

    const result = await replaceAllKeywords(keywords);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      inserted: result.inserted,
    });
  } catch (error) {
    console.error('키워드 동기화 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
