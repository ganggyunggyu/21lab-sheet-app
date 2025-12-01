import { NextRequest, NextResponse } from 'next/server';
import { replaceAllRootKeywords } from '@/entities/keyword';
import { parseRootSheetData } from '@/entities/keyword/api/rootParser';
import { ROOT_IMPORT_CONFIG, ROOT_SYNC_CONFIG } from '@/shared/constants/sheet';

export async function POST(request: NextRequest) {
  try {
    const sheetId = ROOT_SYNC_CONFIG.SHEET_ID;

    if (!sheetId) {
      return NextResponse.json(
        { error: 'sheetId가 필요합니다' },
        { status: 400 }
      );
    }

    console.log('🔥 루트건바이 동기화 시작:', { sheetId });

    const keywords = await parseRootSheetData(sheetId);

    console.log('🔥 파싱된 키워드 개수:', keywords.length);
    console.log('🔥 파싱된 데이터 샘플:', keywords.slice(0, 3));

    const result = await replaceAllRootKeywords(keywords);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      inserted: result.inserted,
    });
  } catch (error) {
    console.error('루트건바 키워드 동기화 에러:', error);
    return NextResponse.json(
      {
        error: '서버 에러가 발생했습니다',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
