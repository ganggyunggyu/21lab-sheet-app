import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsByCompany } from '@/entities/keyword';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ error: '회사명이 필요합니다' }, { status: 400 });
    }

    const keywords = await getKeywordsByCompany(decodeURIComponent(name));
    return NextResponse.json({ data: keywords });
  } catch (error) {
    console.error('회사별 키워드 조회 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다' }, { status: 500 });
  }
}
