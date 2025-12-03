import { google } from 'googleapis';
import { DEFAULT_SHEET_RANGE } from '@/shared/constants/sheet';

export const getGoogleSheetsClient = (readOnly = false) => {
  const scopes = readOnly
    ? ['https://www.googleapis.com/auth/spreadsheets.readonly']
    : ['https://www.googleapis.com/auth/spreadsheets'];

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes,
  });

  return google.sheets({ version: 'v4', auth });
};

export const getSheetData = async (
  spreadsheetId: string,
  sheetName?: string,
  range = DEFAULT_SHEET_RANGE
) => {
  if (!sheetName) return;
  const sheets = getGoogleSheetsClient();

  const fullRange = sheetName ? `${sheetName}!${range}` : range;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });

  return response.data.values || [];
};

export const appendSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  sheetName?: string
) => {
  const sheets = getGoogleSheetsClient();

  const fullRange = sheetName ? `${sheetName}!${range}` : range;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: fullRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return response.data;
};

export const updateSheetData = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
  sheetName?: string
) => {
  const sheets = getGoogleSheetsClient();

  const fullRange = sheetName ? `${sheetName}!${range}` : range;

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: fullRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return response.data;
};

export const getSpreadsheetMetadata = async (spreadsheetId: string) => {
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  return (
    response.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title || '',
      sheetId: sheet.properties?.sheetId || 0,
    })) || []
  );
};

export const formatDateToKorean = (date: Date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월${day}일`;
};

export const batchUpdateSheetData = async (
  spreadsheetId: string,
  updates: Array<{ range: string; values: string[][] }>,
  sheetName?: string
) => {
  const sheets = getGoogleSheetsClient();

  const data = updates.map((update) => ({
    range: sheetName ? `${sheetName}!${update.range}` : update.range,
    values: update.values,
  }));

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });

  return response.data;
};

export const syncVisibilityToCompanySheet = async (
  spreadsheetId: string,
  keyword: string,
  date: Date = new Date()
) => {
  const sheets = getGoogleSheetsClient();
  const targetDate = formatDateToKorean(date);
  const metadata = await getSpreadsheetMetadata(spreadsheetId);

  const results = [];

  for (const tab of metadata) {
    const tabName = tab.title;

    const headerRange = `${tabName}!1:1`;
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    const headers = headerResponse.data.values?.[0] || [];
    const keywordColIndex = headers.findIndex((h) => h === '키워드');
    const dateColIndex = headers.findIndex((h) => h === targetDate);

    if (keywordColIndex === -1 || dateColIndex === -1) {
      results.push({
        tab: tabName,
        success: false,
        message: `키워드 또는 날짜 컬럼을 찾을 수 없어 (keywordCol: ${keywordColIndex}, dateCol: ${dateColIndex})`,
      });
      continue;
    }

    const dataRange = `${tabName}!A:ZZ`;
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: dataRange,
    });

    const rows = dataResponse.data.values || [];
    const keywordRowIndex = rows.findIndex(
      (row, idx) => idx > 0 && row[keywordColIndex] === keyword
    );

    if (keywordRowIndex === -1) {
      results.push({
        tab: tabName,
        success: false,
        message: `키워드 "${keyword}"를 찾을 수 없어`,
      });
      continue;
    }

    const targetCell = `${tabName}!${String.fromCharCode(65 + dateColIndex)}${
      keywordRowIndex + 1
    }`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetCell,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['O']],
      },
    });

    results.push({
      tab: tabName,
      success: true,
      message: `업데이트 성공! (행: ${
        keywordRowIndex + 1
      }, 컬럼: ${String.fromCharCode(65 + dateColIndex)})`,
    });
  }

  return results;
};

interface ClearColsParams {
  spreadsheetId: string; // 구글 시트 ID
  sheetName: string; // 탭 이름 (예: '시트1')
}

/**
 * 지정한 시트에서 A~M 컬럼 전체 값을 삭제
 * (컬럼 구조는 그대로 두고, 값만 싹 지움)
 */
export const clearColsAtoG = async ({
  spreadsheetId,
  sheetName,
}: ClearColsParams) => {
  const sheets = getGoogleSheetsClient();

  const range = `${sheetName}!A:M`;

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
};
