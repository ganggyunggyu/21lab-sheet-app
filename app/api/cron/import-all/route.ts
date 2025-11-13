import { NextResponse } from 'next/server';

const SHEET_ID = '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0';

export async function GET() {
  try {
    console.log('🔥 [CRON] 전체 노출현황 적용 시작:', new Date().toISOString());

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/keywords/import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: 'all',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '노출현황 적용 실패');
    }

    const result = await response.json();
    console.log('✅ [CRON] 전체 노출현황 적용 완료!');
    console.log('   - 결과:', result);
    console.log('🔥 [CRON] 완료 시간:', new Date().toISOString());

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ [CRON] 전체 노출현황 적용 에러:', error);
    return NextResponse.json(
      {
        error: '노출현황 적용 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
