import { NextRequest, NextResponse } from 'next/server';
import { syncVisibilityToCompanySheet } from '@/lib/google-sheets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: '키워드가 필요해' },
        { status: 400 }
      );
    }

    const results = await syncVisibilityToCompanySheet(id, keyword);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      results,
      summary: {
        total: results.length,
        success: successCount,
        fail: failCount,
      },
    });
  } catch (error) {
    console.error('Error syncing visibility:', error);
    return NextResponse.json(
      { error: '동기화 실패했어' },
      { status: 500 }
    );
  }
}
