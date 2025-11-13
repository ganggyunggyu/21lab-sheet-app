'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SheetTable, ThemeToggle, useSheetData } from '@/features';
import { useCompanyList } from '@/entities';

const SHEET_ID = '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0';
const SHEET_NAMES = {
  PACKAGE: '패키지',
  DOGMARU_EXCLUDE: '도그마루 제외',
} as const;

type MainTab = 'package' | 'dogmaru-exclude';

interface KeywordData {
  company: string;
  keyword: string;
  visibility: boolean;
  popularTopic: string;
  url: string;
  sheetType: 'package' | 'dogmaru-exclude';
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>('package');
  const [isSyncing, setIsSyncing] = useState(false);
  const { companyList } = useCompanyList();

  const currentSheetName =
    activeTab === 'package' ? SHEET_NAMES.PACKAGE : SHEET_NAMES.DOGMARU_EXCLUDE;

  const { data } = useSheetData(SHEET_ID, currentSheetName);

  useEffect(() => {
    if (!data?.data || data.data.length === 0) return;

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
      console.log('⚠️ 필요한 컬럼을 찾을 수 없습니다');
      return;
    }

    let currentCompany = '';
    const keywordDataList: KeywordData[] = sheetData
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
          sheetType: activeTab,
        };
      })
      .filter((item) => item.company && item.keyword);

    console.log('📊 키워드 데이터:', keywordDataList);
    console.log('📈 총 개수:', keywordDataList.length);
    console.log('✅ 노출:', keywordDataList.filter((d) => d.visibility).length);
    console.log(
      '❌ 미노출:',
      keywordDataList.filter((d) => !d.visibility).length
    );
  }, [data]);

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
  };

  const handleCompanyClick = (companySheetId: string) => {
    router.push(`/sheets/${companySheetId}`);
  };

  const handleSyncToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('데이터베이스 동기화 중...');

    try {
      const response = await fetch('/api/keywords/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: currentSheetName,
          sheetType: activeTab,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '동기화 실패');
      }

      const result = await response.json();

      toast.success(
        `동기화 완료! (삭제: ${result.deleted}, 삽입: ${result.inserted})`,
        { id: toastId }
      );
    } catch (error) {
      console.error('동기화 에러:', error);
      toast.error(
        error instanceof Error ? error.message : '동기화에 실패했습니다',
        { id: toastId }
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllToDB = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('전체 시트 동기화 중...');

    try {
      // 1. 패키지 동기화
      toast.loading('패키지 동기화 중...', { id: toastId });
      const packageResponse = await fetch('/api/keywords/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: SHEET_NAMES.PACKAGE,
          sheetType: 'package',
        }),
      });

      if (!packageResponse.ok) {
        const errorData = await packageResponse.json();
        throw new Error(`패키지 동기화 실패: ${errorData.error}`);
      }

      const packageResult = await packageResponse.json();
      console.log('✅ 패키지 동기화 완료:', packageResult);

      // 2. 도그마루 제외 동기화
      toast.loading('도그마루 제외 동기화 중...', { id: toastId });
      const dogmaruResponse = await fetch('/api/keywords/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: SHEET_NAMES.DOGMARU_EXCLUDE,
          sheetType: 'dogmaru-exclude',
        }),
      });

      if (!dogmaruResponse.ok) {
        const errorData = await dogmaruResponse.json();
        throw new Error(`도그마루 제외 동기화 실패: ${errorData.error}`);
      }

      const dogmaruResult = await dogmaruResponse.json();
      console.log('✅ 도그마루 제외 동기화 완료:', dogmaruResult);

      // 3. 결과 메시지
      const totalDeleted = packageResult.deleted + dogmaruResult.deleted;
      const totalInserted = packageResult.inserted + dogmaruResult.inserted;

      toast.success(
        `전체 동기화 완료! 패키지: ${packageResult.inserted}개, 도그마루 제외: ${dogmaruResult.inserted}개 (총 삭제: ${totalDeleted}, 총 삽입: ${totalInserted})`,
        { id: toastId, duration: 5000 }
      );
    } catch (error) {
      console.error('전체 동기화 에러:', error);
      toast.error(
        error instanceof Error ? error.message : '전체 동기화에 실패했습니다',
        { id: toastId }
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportFromDB = async () => {
    const toastId = toast.loading('노출현황 불러오는 중...');

    try {
      const response = await fetch('/api/keywords/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: 'all',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '불러오기 실패');
      }

      const result = await response.json();

      toast.success(`적용 완료! ${result.updated}개 셀 업데이트됨 (전체 탭)`, { id: toastId });
    } catch (error) {
      console.error('불러오기 에러:', error);
      toast.error(
        error instanceof Error ? error.message : '불러오기에 실패했습니다',
        { id: toastId }
      );
    }
  };

  const handleMatchRootCompany = async () => {
    const toastId = toast.loading('루트 업체명 적용 중...');

    try {
      // 1. 루트키워드 전부 가져오기
      const rootResponse = await fetch('/api/root-keywords');
      if (!rootResponse.ok) {
        throw new Error('루트키워드 조회 실패');
      }
      const rootData = await rootResponse.json();
      const rootKeywords = rootData.keywords;

      console.log('🔥 [Step 1] 루트키워드 전체 개수:', rootKeywords.length);
      console.log('🔥 [Step 1] 루트키워드 처음 10개:');
      rootKeywords.slice(0, 10).forEach((kw: any, idx: number) => {
        console.log(
          `  ${idx + 1}. "${kw.keyword}" (company: ${kw.company}, createdAt: ${
            kw.createdAt
          })`
        );
      });

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

      // 3. 패키지 키워드를 "순서대로 1:1" 매칭 (내용 비교 없이 순차 소비)
      console.log('🔥 [Step 3] 매칭 시작 (순서 기반 1:1 소비)');

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

        console.log(
          `  ✅ [${i + 1}/${totalPairs}] 행 ${packageKeyword.rowIndex + 1}: "${
            packageKeyword.keyword
          }" → "${rootKw.keyword}" (순서 매칭)`
        );
      }

      if (rootCompanyKeywords.length > totalPairs) {
        console.log(
          `  ⏭️  남은 ${
            rootCompanyKeywords.length - totalPairs
          }개는 루트키워드 부족으로 스킵`
        );
      }

      console.log('🔥 [Step 4] 매칭 완료!');
      console.log('🔥 총 매칭된 키워드 수:', matchResults.length);
      console.log(
        '🔥 매칭 안된 키워드 수:',
        rootCompanyKeywords.length - totalPairs
      );

      if (matchResults.length === 0) {
        toast('매칭된 키워드가 없습니다', { id: toastId });
        return;
      }

      // 4. 시트에 업데이트
      toast.loading('시트에 적용 중...', { id: toastId });

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

      const keywordColumn = getColumnLetter(keywordColumnIndex);
      const updates = matchResults.map((result) => ({
        range: `${keywordColumn}${result.rowIndex + 1}`,
        values: [[result.newKeyword]],
      }));

      const updateResponse = await fetch(
        `/api/sheets/${SHEET_ID}/batch-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates,
            sheetName: currentSheetName,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || '시트 업데이트 실패');
      }

      const updateResult = await updateResponse.json();
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

  const handleRemoveRootCompany = async () => {
    const toastId = toast.loading('루트 업체명 제거 중...');

    try {
      // 1. 현재 시트 데이터에서 "루트" 업체명인 키워드들 찾기
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

      const keywordColumn = getColumnLetter(keywordColumnIndex);
      const updates = removeResults.map((result) => ({
        range: `${keywordColumn}${result.rowIndex + 1}`,
        values: [[result.newKeyword]],
      }));

      const updateResponse = await fetch(
        `/api/sheets/${SHEET_ID}/batch-update`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates,
            sheetName: currentSheetName,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || '시트 업데이트 실패');
      }

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-normal text-gray-900 dark:text-white">
            Google Sheets Manager
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/root-gunba')}
              className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              Root Gunba
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('package')}
              className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'package'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              패키지
            </button>
            <button
              onClick={() => handleTabChange('dogmaru-exclude')}
              className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'dogmaru-exclude'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              도그마루 제외
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleMatchRootCompany}
              className="rounded bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              루트 업체명 적용
            </button>
            <button
              onClick={handleRemoveRootCompany}
              className="rounded bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              루트 업체명 제거
            </button>
            <button
              onClick={handleImportFromDB}
              className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              노출현황 불러오기
            </button>
            <button
              onClick={handleSyncToDB}
              disabled={isSyncing}
              className="rounded bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600"
            >
              {isSyncing ? '동기화 중...' : '내보내기'}
            </button>
            <button
              onClick={handleSyncAllToDB}
              disabled={isSyncing}
              className="rounded bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {isSyncing ? '동기화 중...' : '전체 내보내기'}
            </button>
          </div>
        </div>

        {companyList.length > 0 && (
          <div className="mb-6 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              회사 목록
            </h2>
            <div className="flex flex-wrap gap-2">
              {companyList.map((company) => (
                <button
                  key={company.sheetId}
                  onClick={() => handleCompanyClick(company.sheetId)}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {company.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <SheetTable
          sheetId={SHEET_ID}
          sheetName={currentSheetName}
          showNavigation={true}
        />
      </div>
    </div>
  );
}
