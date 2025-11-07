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
      (header) => header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
    );
    const visibilityColumnIndex = headers.findIndex(
      (header) => header?.toLowerCase().includes('노출여부') || header?.toLowerCase().includes('노출')
    );
    const popularTopicColumnIndex = headers.findIndex(
      (header) => header?.toLowerCase().includes('인기주제')
    );
    const urlColumnIndex = headers.findIndex(
      (header) => header?.toLowerCase() === 'url'
    );

    if (companyColumnIndex === -1 || keywordColumnIndex === -1 || visibilityColumnIndex === -1) {
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
          popularTopic: popularTopicColumnIndex !== -1 ? (row[popularTopicColumnIndex] || '') : '',
          url: urlColumnIndex !== -1 ? (row[urlColumnIndex] || '') : '',
        };
      })
      .filter((item) => item.company && item.keyword);

    console.log('📊 키워드 데이터:', keywordDataList);
    console.log('📈 총 개수:', keywordDataList.length);
    console.log('✅ 노출:', keywordDataList.filter((d) => d.visibility).length);
    console.log('❌ 미노출:', keywordDataList.filter((d) => !d.visibility).length);
  }, [data]);

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
  };

  const handleCompanyClick = (companySheetId: string) => {
    router.push(`/sheets/${companySheetId}`);
  };

  const handleSyncToDB = async () => {
    if (!data?.data || data.data.length === 0) {
      toast.error('동기화할 데이터가 없습니다');
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading('데이터베이스 동기화 중...');

    try {
      const sheetData = data.data;
      const headers = sheetData[0] || [];

      const companyColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase() === '회사명' ||
          header?.toLowerCase() === 'name' ||
          header?.toLowerCase() === '업체'
      );
      const keywordColumnIndex = headers.findIndex(
        (header) => header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
      );
      const visibilityColumnIndex = headers.findIndex(
        (header) =>
          header?.toLowerCase().includes('노출여부') || header?.toLowerCase().includes('노출')
      );
      const popularTopicColumnIndex = headers.findIndex(
        (header) => header?.toLowerCase().includes('인기주제')
      );
      const urlColumnIndex = headers.findIndex(
        (header) => header?.toLowerCase() === 'url'
      );

      if (
        companyColumnIndex === -1 ||
        keywordColumnIndex === -1 ||
        visibilityColumnIndex === -1
      ) {
        toast.error('필요한 컬럼을 찾을 수 없습니다', { id: toastId });
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
            popularTopic: popularTopicColumnIndex !== -1 ? (row[popularTopicColumnIndex] || '') : '',
            url: urlColumnIndex !== -1 ? (row[urlColumnIndex] || '') : '',
            sheetType: activeTab,
          };
        })
        .filter((item) => item.company && item.keyword);

      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keywordDataList),
      });

      if (!response.ok) {
        throw new Error('동기화 실패');
      }

      const result = await response.json();

      toast.success(
        `동기화 완료! (삭제: ${result.deleted}, 삽입: ${result.inserted})`,
        { id: toastId }
      );
    } catch (error) {
      console.error('동기화 에러:', error);
      toast.error('동기화에 실패했습니다', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-normal text-gray-900 dark:text-white">
            Google Sheets Manager
          </h1>
          <ThemeToggle />
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

          <button
            onClick={handleSyncToDB}
            disabled={isSyncing}
            className="rounded bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600"
          >
            {isSyncing ? '동기화 중...' : 'DB 동기화'}
          </button>
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

        <SheetTable sheetId={SHEET_ID} sheetName={currentSheetName} showNavigation={true} />
      </div>
    </div>
  );
}
