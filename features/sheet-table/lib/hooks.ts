import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addSheetRow,
  fetchSheetData,
  updateSheetRow,
  fetchSpreadsheetMetadata,
  syncVisibility,
} from '@/entities/sheet';

export const queryKeys = {
  sheets: {
    all: ['sheets'] as const,
    detail: (sheetId: string, sheetName?: string) =>
      [...queryKeys.sheets.all, sheetId, sheetName] as const,
    metadata: (sheetId: string) =>
      [...queryKeys.sheets.all, sheetId, 'metadata'] as const,
  },
};

export const useSheetData = (sheetId: string, sheetName?: string) => {
  return useQuery({
    queryKey: queryKeys.sheets.detail(sheetId, sheetName),
    queryFn: () => fetchSheetData(sheetId, sheetName),
    enabled: !!sheetId,
  });
};

export const useAddSheetRow = (sheetId: string, sheetName?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSheetRow,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sheets.detail(sheetId, sheetName),
      });
    },
  });
};

export const useUpdateSheetRow = (sheetId: string, sheetName?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSheetRow,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sheets.detail(sheetId, sheetName),
      });
    },
  });
};

export const useSpreadsheetMetadata = (sheetId: string) => {
  return useQuery({
    queryKey: queryKeys.sheets.metadata(sheetId),
    queryFn: () => fetchSpreadsheetMetadata(sheetId),
    enabled: !!sheetId,
  });
};

export const useSyncVisibility = () => {
  return useMutation({
    mutationFn: syncVisibility,
  });
};
