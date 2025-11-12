import { NextRequest, NextResponse } from 'next/server';
import {
  replaceAllKeywords,
  getAllKeywords,
  updateKeywordVisibility,
  type KeywordData,
} from '@/entities/keyword';

export async function POST(request: NextRequest) {
  try {
    const keywords: KeywordData[] = await request.json();

    if (!Array.isArray(keywords)) {
      return NextResponse.json(
        { error: '키워드 배열이 필요합니다' },
        { status: 400 }
      );
    }

    const result = await replaceAllKeywords(keywords);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      inserted: result.inserted,
    });
  } catch (error) {
    console.error('키워드 동기화 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const keywords = await getAllKeywords();
    return NextResponse.json({ data: keywords });
  } catch (error) {
    console.error('키워드 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { company, keyword, visibility, sheetType } = await request.json();

    if (!company || !keyword || typeof visibility !== 'boolean') {
      return NextResponse.json(
        { error: 'company, keyword, visibility가 필요합니다' },
        { status: 400 }
      );
    }

    const result = await updateKeywordVisibility(company, keyword, visibility, sheetType);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('키워드 업데이트 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
