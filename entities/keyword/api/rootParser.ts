import { getGoogleSheetsClient } from '@/lib/google-sheets';
import { RootKeywordData } from '../model';

const STOP_KEYWORDS = ['자료 미전달', '지료 미전달', '미전달 리스트'];

const isStopRow = (row: string[]): boolean => {
  const rowText = row.join(' ').toLowerCase();
  return STOP_KEYWORDS.some((keyword) => rowText.includes(keyword.toLowerCase()));
};

export async function parseRootSheetData(
  sheetId: string
): Promise<RootKeywordData[]> {
  const sheets = getGoogleSheetsClient(true);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A1:Z1000',
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  // 빈 행 건너뛰고 헤더 찾기
  const headerIdx = rows.findIndex(
    (row) => row && row.length > 0 && row.some((cell) => cell && cell.trim())
  );

  if (headerIdx === -1) {
    throw new Error('헤더를 찾을 수 없습니다');
  }

  const headers = rows[headerIdx] || [];

  const keywordColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
  );
  const companyColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase() === '업체명' || header?.toLowerCase().includes('업체')
  );
  const visibilityColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase().includes('노출여부') ||
      header?.toLowerCase().includes('노출') ||
      header?.toLowerCase().includes('공정위')
  );
  const urlColumnIndex = headers.findIndex(
    (header) => header?.toLowerCase().includes('시트') && header?.toLowerCase().includes('링크')
  );

  if (keywordColumnIndex === -1 || companyColumnIndex === -1) {
    throw new Error('필수 컬럼(키워드, 업체명)을 찾을 수 없습니다');
  }

  const dataRows = rows.slice(headerIdx + 1);

  // "자료 미전달 리스트" 행 찾기 - 그 이전까지만 파싱
  const stopRowIdx = dataRows.findIndex((row) => isStopRow(row));
  const validRows = stopRowIdx === -1 ? dataRows : dataRows.slice(0, stopRowIdx);

  let currentCompany = '';
  const keywordDataList: RootKeywordData[] = validRows
    .filter((row) => row[keywordColumnIndex])
    .map((row) => {
      if (row[companyColumnIndex] && row[companyColumnIndex].trim()) {
        currentCompany = row[companyColumnIndex].trim();
      }

      const keyword = row[keywordColumnIndex] || '';
      const company = currentCompany || '';

      const formattedKeyword = company ? `${keyword}(${company})` : keyword;

      return {
        company,
        keyword: formattedKeyword,
        visibility: visibilityColumnIndex !== -1
          ? (row[visibilityColumnIndex] || '').toLowerCase() === 'o'
          : false,
        url: urlColumnIndex !== -1 ? row[urlColumnIndex] || '' : '',
      };
    })
    .filter((item) => item.company && item.keyword);

  return keywordDataList;
}
