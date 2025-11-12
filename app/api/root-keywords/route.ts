import { NextResponse } from 'next/server';
import { getAllRootKeywords } from '@/entities/keyword';

export async function GET() {
  try {
    const keywords = await getAllRootKeywords();

    return NextResponse.json({
      success: true,
      keywords,
    });
  } catch (error) {
    console.error('루트 키워드 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
