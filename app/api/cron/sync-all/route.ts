import { NextResponse } from 'next/server';
import { syncAllSheets } from '@/src/lib/cron';

export async function GET() {
  try {
    const result = await syncAllSheets();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API 동기화 에러:', error);
    return NextResponse.json(
      {
        error: '동기화 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
