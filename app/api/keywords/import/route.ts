import { NextRequest, NextResponse } from 'next/server';
import { getAllKeywords } from '@/entities/keyword';
import { getSheetData, batchUpdateSheetData } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { sheetId, sheetName, sheetType } = await request.json();

    if (!sheetId || !sheetName || !sheetType) {
      return NextResponse.json(
        { error: 'sheetId, sheetName, sheetType이 필요합니다' },
        { status: 400 }
      );
    }

    console.log('🔥 DB → 시트 노출여부 불러오기 시작:', { sheetId, sheetName, sheetType });

    // 1. DB에서 해당 sheetType의 키워드 전체 조회
    const dbKeywords = await getAllKeywords();
    const filteredKeywords = dbKeywords.filter((kw: any) => kw.sheetType === sheetType);

    console.log('🔥 DB 키워드 개수:', filteredKeywords.length);

    // 2. 현재 시트 데이터 조회
    const sheetData = await getSheetData(sheetId, sheetName);

    if (!sheetData || sheetData.length === 0) {
      return NextResponse.json(
        { error: '시트 데이터가 없습니다' },
        { status: 400 }
      );
    }

    const headers = sheetData[0] || [];
    const companyColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase() === '회사명' ||
        header?.toLowerCase() === 'name' ||
        header?.toLowerCase() === '업체'
    );
    const keywordColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase() === '키워드' ||
        header?.toLowerCase() === 'keyword'
    );
    const popularTopicColumnIndex = headers.findIndex(
      (header) => header?.toLowerCase().includes('인기주제')
    );
    const visibilityColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase().includes('노출여부') ||
        header?.toLowerCase().includes('노출')
    );

    if (companyColumnIndex === -1 || keywordColumnIndex === -1 || visibilityColumnIndex === -1) {
      return NextResponse.json(
        { error: '필요한 컬럼을 찾을 수 없습니다' },
        { status: 400 }
      );
    }

    console.log('🔥 컬럼 인덱스:', { companyColumnIndex, keywordColumnIndex, popularTopicColumnIndex, visibilityColumnIndex });

    // 3. 시트 데이터와 DB 키워드 매칭
    const updates: Array<{ range: string; values: string[][] }> = [];
    let currentCompany = '';

    sheetData.slice(1).forEach((row, idx) => {
      if (row[companyColumnIndex]) {
        currentCompany = row[companyColumnIndex];
      }

      const keyword = row[keywordColumnIndex];
      const popularTopic = popularTopicColumnIndex !== -1 ? row[popularTopicColumnIndex] || '' : '';
      const url = headers.findIndex(h => h?.toLowerCase() === 'url') !== -1
        ? row[headers.findIndex(h => h?.toLowerCase() === 'url')] || ''
        : '';

      if (!keyword || !currentCompany) return;

      // DB에서 해당 키워드 찾기 - company + keyword + popularTopic + url 조합
      const dbKeyword = filteredKeywords.find(
        (kw: any) =>
          kw.company === currentCompany &&
          kw.keyword === keyword &&
          kw.popularTopic === popularTopic &&
          kw.url === url
      );

      if (dbKeyword) {
        // visibility 값에 따라 "O" 또는 공백
        const visibilityValue = dbKeyword.visibility ? 'O' : '';

        // 컬럼 인덱스를 A1 표기법으로 변환
        const getColumnLetter = (colIndex: number): string => {
          let letter = '';
          let temp = colIndex + 1;
          while (temp > 0) {
            const remainder = (temp - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            temp = Math.floor((temp - 1) / 26);
          }
          return letter;
        };

        const visibilityColumn = getColumnLetter(visibilityColumnIndex);
        const rowNumber = idx + 2; // 헤더 제외 + 1-based index

        updates.push({
          range: `${visibilityColumn}${rowNumber}`,
          values: [[visibilityValue]],
        });
      }
    });

    console.log('🔥 업데이트할 셀 개수:', updates.length);

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: '업데이트할 데이터가 없습니다',
      });
    }

    // 4. 배치 업데이트
    await batchUpdateSheetData(sheetId, updates, sheetName);

    console.log('✅ 시트 업데이트 완료!');

    return NextResponse.json({
      success: true,
      updated: updates.length,
    });
  } catch (error) {
    console.error('노출여부 불러오기 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
