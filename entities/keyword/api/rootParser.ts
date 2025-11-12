import { google } from 'googleapis';
import { RootKeywordData } from '../model';

const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH || '';

export async function parseRootSheetData(
  sheetId: string
): Promise<RootKeywordData[]> {
  const svcEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const svcKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  let auth: InstanceType<typeof google.auth.GoogleAuth>;
  if (svcEmail && svcKey) {
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: svcEmail,
        private_key: svcKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } else if (CREDENTIALS_PATH) {
    auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } else {
    throw new Error(
      'Google credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS_PATH.'
    );
  }

  const sheets = google.sheets({ version: 'v4', auth });

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

  let currentCompany = '';
  const keywordDataList: RootKeywordData[] = rows
    .slice(headerIdx + 1)
    .filter((row) => row[keywordColumnIndex])
    .map((row) => {
      // 업체명 이어받기
      if (row[companyColumnIndex] && row[companyColumnIndex].trim()) {
        currentCompany = row[companyColumnIndex].trim();
      }

      const keyword = row[keywordColumnIndex] || '';
      const company = currentCompany || '';

      // 키워드(업체명) 형식으로 저장
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
