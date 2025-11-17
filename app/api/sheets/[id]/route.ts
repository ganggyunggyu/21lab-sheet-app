import { NextRequest, NextResponse } from 'next/server';
import {
  getSheetData,
  appendSheetData,
  updateSheetData,
} from '@/lib/google-sheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName') || undefined;

    const data = await getSheetData(id, sheetName);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json(
      { error: '시트 데이터를 가져오는데 실패했어' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { range, values, sheetName } = await request.json();

    const result = await appendSheetData(id, range, values, sheetName);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error appending sheet data:', error);
    return NextResponse.json(
      { error: '데이터 추가에 실패했어' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { range, values, sheetName } = await request.json();

    const result = await updateSheetData(id, range, values, sheetName);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error updating sheet data:', error);
    return NextResponse.json(
      { error: '데이터 수정에 실패했어' },
      { status: 500 }
    );
  }
}
