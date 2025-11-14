import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/shared/api/client';
import type { MainTab } from '@/shared/config/sheet';

// 동기화 요청 타입
interface SyncRequest {
  sheetId: string;
  sheetName: string;
  sheetType: MainTab;
}

interface SyncResponse {
  success: boolean;
  deleted: number;
  inserted: number;
}

// 노출현황 불러오기 요청 타입
interface ImportRequest {
  sheetId: string;
  sheetName: string;
}

interface ImportResponse {
  success: boolean;
  updated: number;
}

// 루트키워드 조회 응답 타입
interface RootKeyword {
  _id: string;
  keyword: string;
  company: string;
  createdAt: string;
}

interface RootKeywordsResponse {
  keywords: RootKeyword[];
}

// 시트 업데이트 요청 타입
interface BatchUpdateRequest {
  updates: Array<{ range: string; values: string[][] }>;
  sheetName: string;
}

interface BatchUpdateResponse {
  totalUpdated?: number;
  totalUpdatedCells?: number;
}

// 단일 시트 동기화
export const useSyncToDB = () => {
  return useMutation({
    mutationFn: async (request: SyncRequest) => {
      const { data } = await apiClient.post<SyncResponse>(
        '/keywords/sync',
        request
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `동기화 완료! (삭제: ${data.deleted}, 삽입: ${data.inserted})`
      );
    },
    onError: (error: Error) => {
      console.error('동기화 에러:', error);
      toast.error(error.message || '동기화에 실패했습니다');
    },
  });
};

// 노출현황 불러오기
export const useImportFromDB = () => {
  return useMutation({
    mutationFn: async (request: ImportRequest) => {
      const { data } = await apiClient.post<ImportResponse>(
        '/keywords/import',
        request
      );
      return data;
    },
    onSuccess: (data, variables) => {
      const mode = variables.sheetName === 'all' ? '전체 탭' : '현재 탭';
      toast.success(`적용 완료! ${data.updated}개 셀 업데이트됨 (${mode})`);
    },
    onError: (error: Error) => {
      console.error('불러오기 에러:', error);
      toast.error(error.message || '불러오기에 실패했습니다');
    },
  });
};

// 루트키워드 조회
export const useFetchRootKeywords = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.get<RootKeywordsResponse>(
        '/root-keywords'
      );
      return data;
    },
  });
};

// 시트 일괄 업데이트
export const useBatchUpdateSheet = () => {
  return useMutation({
    mutationFn: async ({
      sheetId,
      request,
    }: {
      sheetId: string;
      request: BatchUpdateRequest;
    }) => {
      const { data } = await apiClient.post<BatchUpdateResponse>(
        `/sheets/${sheetId}/batch-update`,
        request
      );
      return data;
    },
  });
};
