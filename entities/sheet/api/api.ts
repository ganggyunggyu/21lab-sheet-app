import { apiClient } from '@/shared';

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
  const { data } = await apiClient.get(url);
  return data;
};

export const addSheetRow = async ({
  sheetId,
  values,
  sheetName,
}: AddSheetRowParams): Promise<SheetData> => {
  const { data } = await apiClient.post(`/sheets/${sheetId}`, {
    range: 'A:ZZ',
    values,
    sheetName,
  });
  return data;
};

export const updateSheetRow = async ({
  sheetId,
  range,
  values,
  sheetName,
}: UpdateSheetRowParams): Promise<SheetData> => {
  const { data } = await apiClient.patch(`/sheets/${sheetId}`, {
    range,
    values,
    sheetName,
  });
  return data;
};

export const fetchSpreadsheetMetadata = async (
  sheetId: string
): Promise<SpreadsheetMetadata> => {
  const { data } = await apiClient.get(`/sheets/${sheetId}/metadata`);
  return data;
};

export const syncVisibility = async ({
  sheetId,
  keyword,
}: SyncVisibilityParams): Promise<SyncResponse> => {
  const { data } = await apiClient.post(`/sheets/${sheetId}/sync`, {
    keyword,
  });
  return data;
};
