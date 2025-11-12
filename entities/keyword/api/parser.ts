import { google } from 'googleapis';
import { KeywordData } from './api';

const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH || '';

export async function parseSheetData(
  sheetId: string,
  sheetName: string,
  sheetType: 'package' | 'dogmaru-exclude'
): Promise<KeywordData[]> {
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
    range: sheetName,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0] || [];

  const companyColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase() === '회사명' ||
      header?.toLowerCase() === 'name' ||
      header?.toLowerCase() === '업체'
  );
  const keywordColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
  );
  const visibilityColumnIndex = headers.findIndex(
    (header) =>
      header?.toLowerCase().includes('노출여부') ||
      header?.toLowerCase().includes('노출')
  );
  const popularTopicColumnIndex = headers.findIndex((header) =>
    header?.toLowerCase().includes('인기주제')
  );
  const urlColumnIndex = headers.findIndex(
    (header) => header?.toLowerCase() === 'url'
  );

  if (
    companyColumnIndex === -1 ||
    keywordColumnIndex === -1 ||
    visibilityColumnIndex === -1
  ) {
    throw new Error('필요한 컬럼을 찾을 수 없습니다');
  }

  let currentCompany = '';
  const keywordDataList: KeywordData[] = rows
    .slice(1)
    .filter((row) => row[keywordColumnIndex])
    .map((row) => {
      if (row[companyColumnIndex]) {
        currentCompany = row[companyColumnIndex];
      }

      return {
        company: currentCompany || '',
        keyword: row[keywordColumnIndex] || '',
        visibility: (row[visibilityColumnIndex] || '').toLowerCase() === 'o',
        popularTopic:
          popularTopicColumnIndex !== -1
            ? row[popularTopicColumnIndex] || ''
            : '',
        url: urlColumnIndex !== -1 ? row[urlColumnIndex] || '' : '',
        sheetType,
      };
    })
    .filter((item) => item.company && item.keyword);

  return keywordDataList;
}
