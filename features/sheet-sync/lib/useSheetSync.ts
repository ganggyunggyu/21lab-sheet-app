import { useAtom, useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import {
  activeTabAtom,
  isSyncingAtom,
  isExportOpenAtom,
} from '@/shared/model/sheet.store';
import {
  SHEET_ID,
  SHEET_NAMES,
  getSheetNameByType,
  getTabLabel,
  type MainTab,
} from '@/shared/config/sheet';
import { useSyncToDB, useImportFromDB } from '../api/mutations';

export const useSheetSync = () => {
  const [activeTab] = useAtom(activeTabAtom);
  const [_, setIsSyncing] = useAtom(isSyncingAtom);
  const setIsExportOpen = useSetAtom(isExportOpenAtom);

  const syncMutation = useSyncToDB();

  const importMutation = useImportFromDB();

  const currentSheetName = getSheetNameByType(activeTab);

  // 현재 탭 동기화
  const handleSyncToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('데이터베이스 동기화 중...');

    try {
      await syncMutation.mutateAsync({
        sheetId: SHEET_ID,
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

  const handleSyncAllToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('전체 시트 동기화 중...');

    try {
      const requests = [
        {
          sheetId: SHEET_ID,
          sheetName: SHEET_NAMES.PACKAGE,
          sheetType: 'package' as MainTab,
        },
        {
          sheetId: SHEET_ID,
          sheetName: SHEET_NAMES.DOGMARU_EXCLUDE,
          sheetType: 'dogmaru-exclude' as MainTab,
        },
        {
          sheetId: SHEET_ID,
          sheetName: SHEET_NAMES.DOGMARU,
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
        sheetId: SHEET_ID,
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

  // 노출현황 불러오기
  const handleImportFromDB = async (mode: 'current' | 'all' = 'current') => {
    const toastId = toast.loading('노출현황 불러오는 중...');

    try {
      await importMutation.mutateAsync({
        sheetId: SHEET_ID,
        sheetName: mode === 'all' ? 'all' : currentSheetName,
      });
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
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
