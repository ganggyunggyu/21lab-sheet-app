import { useAtom, useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import {
  activeTabAtom,
  isSyncingAtom,
  isExportOpenAtom,
  importModeAtom,
} from '@/shared/model/sheet.store';
import {
  PRODUCTION_CONFIG,
  TEST_CONFIG,
  getSheetNameByType,
  getTabLabel,
  type MainTab,
} from '@/shared/constants/sheet';
import { useSyncToDB, useImportFromDB } from '../api/mutations';

export const useSheetSync = () => {
  const [activeTab] = useAtom(activeTabAtom);
  const setIsSyncing = useSetAtom(isSyncingAtom);
  const setIsExportOpen = useSetAtom(isExportOpenAtom);
  const [importMode] = useAtom(importModeAtom); // 🔥 테스트 모드

  const syncMutation = useSyncToDB();

  const importMutation = useImportFromDB();

  const currentSheetName = getSheetNameByType(activeTab);

  // 현재 탭 동기화
  const handleSyncToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('데이터베이스 동기화 중...');

    try {
      await syncMutation.mutateAsync({
        sheetId: PRODUCTION_CONFIG.SHEET_ID,
        sheetName: currentSheetName,
        sheetType: activeTab,
      });
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
    } finally {
      setIsSyncing(false);
    }
  };
  // 전체 탭 동기화
  const handleSyncAllToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('전체 시트 동기화 중...');

    try {
      const requests = [
        {
          sheetId: PRODUCTION_CONFIG.SHEET_ID,
          sheetName: PRODUCTION_CONFIG.SHEET_NAMES.PACKAGE,
          sheetType: 'package' as MainTab,
        },
        {
          sheetId: PRODUCTION_CONFIG.SHEET_ID,
          sheetName: PRODUCTION_CONFIG.SHEET_NAMES.DOGMARU_EXCLUDE,
          sheetType: 'dogmaru-exclude' as MainTab,
        },
        {
          sheetId: PRODUCTION_CONFIG.SHEET_ID,
          sheetName: PRODUCTION_CONFIG.SHEET_NAMES.DOGMARU,
          sheetType: 'dogmaru' as MainTab,
        },
      ];

      await syncMutation.mutateAsync(requests[0]);
      await syncMutation.mutateAsync(requests[1]);
      await syncMutation.mutateAsync(requests[2]);
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
    } finally {
      setIsSyncing(false);
    }
  };

  // 특정 탭 동기화
  const handleSyncSpecific = async (type: MainTab) => {
    setIsSyncing(true);
    const label = getTabLabel(type);
    const toastId = toast.loading(`${label} 내보내기 중...`);

    try {
      await syncMutation.mutateAsync({
        sheetId: PRODUCTION_CONFIG.SHEET_ID,
        sheetName: getSheetNameByType(type),
        sheetType: type,
      });
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
    } finally {
      setIsSyncing(false);
    }
  };

  // 노출현황 전체 불러오기
  const handleImportFromDB = async (mode: 'current' | 'all' | 'root-import' = 'current') => {
    if (mode === 'root-import') {
      const { ROOT_IMPORT_CONFIG } = await import('@/shared/constants/sheet');
      const modeText =
        importMode === 'rewrite' ? '루트 임포트 전체 재작성 중' : '루트 임포트 노출현황 불러오는 중';
      const toastId = toast.loading(modeText);

      try {
        await importMutation.mutateAsync({
          sheetId: ROOT_IMPORT_CONFIG.SHEET_ID,
          sheetName: ROOT_IMPORT_CONFIG.SHEET_NAMES.ROOT,
          sheetType: 'root-import',
          mode: importMode,
        });
        toast.dismiss(toastId);
      } catch (error) {
        toast.dismiss(toastId);
      }
      return;
    }

    if (mode === 'all') {
      const requests = [
        {
          sheetId: TEST_CONFIG.SHEET_ID,
          sheetName: TEST_CONFIG.SHEET_NAMES.PACKAGE,
          sheetType: 'package' as MainTab,
          mode: importMode, // 🔥 현재 선택된 모드 전달
        },
        {
          sheetId: TEST_CONFIG.SHEET_ID,
          sheetName: TEST_CONFIG.SHEET_NAMES.DOGMARU_EXCLUDE,
          sheetType: 'dogmaru-exclude' as MainTab,
          mode: importMode, // 🔥 현재 선택된 모드 전달
        },
        {
          sheetId: TEST_CONFIG.SHEET_ID,
          sheetName: TEST_CONFIG.SHEET_NAMES.DOGMARU,
          sheetType: 'dogmaru' as MainTab,
          mode: importMode, // 🔥 현재 선택된 모드 전달
        },
      ];

      const modeText =
        importMode === 'rewrite' ? '전체 재작성 중' : '노출현황 불러오는 중';
      const toastId = toast.loading(modeText);

      try {
        await importMutation.mutateAsync(requests[0]);
        await importMutation.mutateAsync(requests[1]);
        await importMutation.mutateAsync(requests[2]);
        toast.dismiss(toastId);
      } catch (error) {
        toast.dismiss(toastId);
      }
    } else {
      const modeText =
        importMode === 'rewrite' ? '전체 재작성 중' : '노출현황 불러오는 중';
      const toastId = toast.loading(modeText);

      try {
        await importMutation.mutateAsync({
          sheetId: TEST_CONFIG.SHEET_ID,
          sheetName: TEST_CONFIG.SHEET_NAMES.DOGMARU_EXCLUDE,
          sheetType: 'dogmaru-exclude' as MainTab,
          mode: importMode,
        });
        toast.dismiss(toastId);
      } catch (error) {
        toast.dismiss(toastId);
      }
    }
  };

  // 내보내기 선택 핸들러
  const handleExportChoice = async (
    which: 'current' | 'all' | 'package' | 'dogmaru' | 'dogmaru-exclude'
  ) => {
    setIsExportOpen(false);
    if (which === 'current') return handleSyncToDB();
    if (which === 'all') return handleSyncAllToDB();
    if (which === 'package') return handleSyncSpecific('package');
    if (which === 'dogmaru') return handleSyncSpecific('dogmaru');
    if (which === 'dogmaru-exclude')
      return handleSyncSpecific('dogmaru-exclude');
  };

  return {
    handleSyncToDB,
    handleSyncAllToDB,
    handleSyncSpecific,
    handleImportFromDB,
    handleExportChoice,
  };
};
