import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import { activeTabAtom } from '@/shared/model/sheet.store';
import { SHEET_ID, getSheetNameByType } from '@/shared/config/sheet';
import { useFetchRootKeywords, useBatchUpdateSheet } from '../api/mutations';
import { useSheetData } from '@/features';

// 컬럼 인덱스를 A1 표기법으로 변환
const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  let temp = colIndex + 1;
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

export const useRootKeywords = () => {
  const [activeTab] = useAtom(activeTabAtom);
  const currentSheetName = getSheetNameByType(activeTab);
  const { data } = useSheetData(SHEET_ID, currentSheetName);

  const fetchRootKeywords = useFetchRootKeywords();
  const batchUpdate = useBatchUpdateSheet();

  // 루트 업체명 적용
  const handleMatchRootCompany = async () => {
    const toastId = toast.loading('루트 업체명 적용 중...');

    try {
      // 1. 루트키워드 전부 가져오기
      const rootData = await fetchRootKeywords.mutateAsync();
      const rootKeywords = rootData.keywords;

      console.log('🔥 [Step 1] 루트키워드 전체 개수:', rootKeywords.length);

      // 2. 현재 시트 데이터에서 "루트" 업체명인 키워드들 찾기
      if (!data?.data || data.data.length === 0) {
        throw new Error('시트 데이터가 없습니다');
      }

      const sheetData = data.data;
      const headers = sheetData[0] || [];

      const companyColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '회사명' ||
          header?.toLowerCase() === 'name' ||
          header?.toLowerCase() === '업체'
      );
      const keywordColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '키워드' ||
          header?.toLowerCase() === 'keyword'
      );

      if (companyColumnIndex === -1 || keywordColumnIndex === -1) {
        throw new Error('필요한 컬럼을 찾을 수 없습니다');
      }

      // "루트" 업체명인 키워드들 찾기
      let currentCompany = '';
      const rootCompanyKeywords: Array<{
        rowIndex: number;
        company: string;
        keyword: string;
      }> = [];

      sheetData.slice(1).forEach((row, idx) => {
        if (row[companyColumnIndex]) {
          currentCompany = row[companyColumnIndex];
        }

        if (currentCompany === '루트' && row[keywordColumnIndex]) {
          rootCompanyKeywords.push({
            rowIndex: idx + 1,
            company: currentCompany,
            keyword: row[keywordColumnIndex],
          });
        }
      });

      console.log(
        '🔥 [Step 2] 패키지에서 "루트" 업체명인 키워드들:',
        rootCompanyKeywords.length,
        '개'
      );

      // 3. 패키지 키워드를 "순서대로 1:1" 매칭
      const matchResults: Array<{
        rowIndex: number;
        originalKeyword: string;
        matchedRootKeyword: string;
        newKeyword: string;
      }> = [];

      const totalPairs = Math.min(
        rootCompanyKeywords.length,
        rootKeywords.length
      );

      for (let i = 0; i < totalPairs; i++) {
        const packageKeyword = rootCompanyKeywords[i];
        const rootKw = rootKeywords[i];

        matchResults.push({
          rowIndex: packageKeyword.rowIndex,
          originalKeyword: packageKeyword.keyword,
          matchedRootKeyword: rootKw.keyword,
          newKeyword: rootKw.keyword,
        });
      }

      console.log('🔥 [Step 3] 매칭 완료!');
      console.log('🔥 총 매칭된 키워드 수:', matchResults.length);

      if (matchResults.length === 0) {
        toast('매칭된 키워드가 없습니다', { id: toastId });
        return;
      }

      // 4. 시트에 업데이트
      toast.loading('시트에 적용 중...', { id: toastId });

      const keywordColumn = getColumnLetter(keywordColumnIndex);
      const updates = matchResults.map((result) => ({
        range: `${keywordColumn}${result.rowIndex + 1}`,
        values: [[result.newKeyword]],
      }));

      const updateResult = await batchUpdate.mutateAsync({
        sheetId: SHEET_ID,
        request: {
          updates,
          sheetName: currentSheetName,
        },
      });

      console.log('✅ 시트 업데이트 완료!', updateResult);

      toast.success(
        `적용 완료! ${matchResults.length}개 업데이트됨 (업데이트 셀: ${
          updateResult.totalUpdated ?? updateResult.totalUpdatedCells ?? 'N/A'
        })`,
        { id: toastId }
      );
    } catch (error) {
      console.error('매칭 에러:', error);
      toast.error(
        error instanceof Error ? error.message : '매칭에 실패했습니다',
        { id: toastId }
      );
    }
  };

  // 루트 업체명 제거
  const handleRemoveRootCompany = async () => {
    const toastId = toast.loading('루트 업체명 제거 중...');

    try {
      if (!data?.data || data.data.length === 0) {
        throw new Error('시트 데이터가 없습니다');
      }

      const sheetData = data.data;
      const headers = sheetData[0] || [];

      const companyColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '회사명' ||
          header?.toLowerCase() === 'name' ||
          header?.toLowerCase() === '업체'
      );
      const keywordColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '키워드' ||
          header?.toLowerCase() === 'keyword'
      );

      if (companyColumnIndex === -1 || keywordColumnIndex === -1) {
        throw new Error('필요한 컬럼을 찾을 수 없습니다');
      }

      // "루트" 업체명인 키워드들 찾기
      let currentCompany = '';
      const removeResults: Array<{
        rowIndex: number;
        originalKeyword: string;
        newKeyword: string;
      }> = [];

      sheetData.slice(1).forEach((row, idx) => {
        if (row[companyColumnIndex]) {
          currentCompany = row[companyColumnIndex];
        }

        if (currentCompany === '루트' && row[keywordColumnIndex]) {
          const keyword = row[keywordColumnIndex];
          // "청주맛집(아키아키)" → "청주맛집" 추출
          const match = keyword.match(/^(.+?)\(/);
          if (match) {
            const baseKeyword = match[1];
            removeResults.push({
              rowIndex: idx + 1,
              originalKeyword: keyword,
              newKeyword: baseKeyword,
            });
          }
        }
      });

      console.log('🔥 제거 결과:', removeResults);
      console.log('🔥 총 제거할 키워드 수:', removeResults.length);

      if (removeResults.length === 0) {
        toast('제거할 업체명이 없습니다', { id: toastId });
        return;
      }

      // 2. 시트에 업데이트
      toast.loading('시트에 적용 중...', { id: toastId });

      const keywordColumn = getColumnLetter(keywordColumnIndex);
      const updates = removeResults.map((result) => ({
        range: `${keywordColumn}${result.rowIndex + 1}`,
        values: [[result.newKeyword]],
      }));

      await batchUpdate.mutateAsync({
        sheetId: SHEET_ID,
        request: {
          updates,
          sheetName: currentSheetName,
        },
      });

      console.log('✅ 시트 업데이트 완료!');

      toast.success(`완료! ${removeResults.length}개 키워드 업체명 제거됨`, {
        id: toastId,
      });
    } catch (error) {
      console.error('제거 에러:', error);
      toast.error(
        error instanceof Error ? error.message : '제거에 실패했습니다',
        { id: toastId }
      );
    }
  };

  return {
    handleMatchRootCompany,
    handleRemoveRootCompany,
  };
};
