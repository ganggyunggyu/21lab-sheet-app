import { NextRequest, NextResponse } from 'next/server';
import { batchUpdateSheetData } from '@/lib/google-sheets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { updates, sheetName } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates 배열이 필요합니다' },
        { status: 400 }
      );
    }

    const result = await batchUpdateSheetData(id, updates, sheetName);

    return NextResponse.json({
      success: true,
      totalUpdated: result.totalUpdatedCells || 0,
    });
  } catch (error) {
    console.error('배치 업데이트 에러:', error);
    return NextResponse.json(
      { error: '배치 업데이트에 실패했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
