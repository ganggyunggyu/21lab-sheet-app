import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/shared/api/client';
import type { MainTab } from '@/shared/constants/sheet';

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
export type ImportMode = 'update' | 'rewrite';

interface ImportRequest {
  sheetId: string;
  sheetName: string;
  sheetType?: MainTab;
  mode?: ImportMode;
}

interface ImportResponse {
  success: boolean;
  updated?: number;
  mode?: ImportMode;
  totalRows?: number; // rewrite 모드에서 사용
  message?: string;
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
      const scopeText = variables.sheetName === 'all' ? '전체 탭' : '현재 탭';
      const modeText =
        data.mode === 'rewrite' ? '전체 재작성' : '노출여부 업데이트';

      if (data.mode === 'rewrite') {
        toast.success(
          `${modeText} 완료! ${data.totalRows}개 행 작성됨 (${scopeText})`
        );
      } else {
        toast.success(
          `${modeText} 완료! ${data.updated}개 셀 업데이트됨 (${scopeText})`
        );
      }
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

// 루트키워드 노출현황 불러오기
export const useImportRootKeywords = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ImportResponse>(
        '/root-keywords/import'
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `루트 임포트 완료! ${data.updated}개 셀 업데이트됨`
      );
    },
    onError: (error: Error) => {
      console.error('루트 임포트 에러:', error);
      toast.error(error.message || '루트 임포트에 실패했습니다');
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
