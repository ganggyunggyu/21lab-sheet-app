import { NextResponse } from 'next/server';
import { getVisibilityStats } from '@/entities/keyword';

export async function GET() {
  try {
    const stats = await getVisibilityStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('통계 조회 에러:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다' }, { status: 500 });
  }
}
