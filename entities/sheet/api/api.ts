import { api } from '@/shared';

export interface SheetData {
  data: string[][];
}

export interface AddSheetRowParams {
  sheetId: string;
  values: string[][];
  sheetName?: string;
}

export interface UpdateSheetRowParams {
  sheetId: string;
  range: string;
  values: string[][];
  sheetName?: string;
}

export interface SheetTab {
  title: string;
  sheetId: number;
}

export interface SpreadsheetMetadata {
  sheets: SheetTab[];
}

export interface SyncVisibilityParams {
  sheetId: string;
  keyword: string;
}

export interface SyncResult {
  tab: string;
  success: boolean;
  message: string;
}

export interface SyncResponse {
  success: boolean;
  results: SyncResult[];
  summary: {
    total: number;
    success: number;
    fail: number;
  };
}

export const fetchSheetData = async (
  sheetId: string,
  sheetName?: string
): Promise<SheetData> => {
  const url = sheetName
    ? `/sheets/${sheetId}?sheetName=${encodeURIComponent(sheetName)}`
    : `/sheets/${sheetId}`;
  return api.get(url);
};

export const addSheetRow = async ({
  sheetId,
  values,
  sheetName,
}: AddSheetRowParams): Promise<SheetData> => {
  return api.post(`/sheets/${sheetId}`, {
    range: 'A:ZZ',
    values,
    sheetName,
  });
};

export const updateSheetRow = async ({
  sheetId,
  range,
  values,
  sheetName,
}: UpdateSheetRowParams): Promise<SheetData> => {
  return api.patch(`/sheets/${sheetId}`, {
    range,
    values,
    sheetName,
  });
};

export const fetchSpreadsheetMetadata = async (
  sheetId: string
): Promise<SpreadsheetMetadata> => {
  return api.get(`/sheets/${sheetId}/metadata`);
};

export const syncVisibility = async ({
  sheetId,
  keyword,
}: SyncVisibilityParams): Promise<SyncResponse> => {
  return api.post(`/sheets/${sheetId}/sync`, { keyword });
};
