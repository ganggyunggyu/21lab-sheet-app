import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetMetadata } from '@/lib/google-sheets';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sheets = await getSpreadsheetMetadata(id);

    return NextResponse.json({ sheets });
  } catch (error) {
    console.error('Error fetching spreadsheet metadata:', error);
    return NextResponse.json(
      { error: '스프레드시트 메타데이터를 가져오는데 실패했어' },
      { status: 500 }
    );
  }
}
