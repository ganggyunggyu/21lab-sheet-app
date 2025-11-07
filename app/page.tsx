'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SheetTable, ThemeToggle } from '@/features';
import { useCompanyList } from '@/entities';

const SHEET_ID = '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0';
const SHEET_NAMES = {
  PACKAGE: '패키지',
  DOGMARU_EXCLUDE: '도그마루 제외',
} as const;

type MainTab = 'package' | 'dogmaru-exclude';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>('package');
  const { companyList } = useCompanyList();

  const currentSheetName =
    activeTab === 'package' ? SHEET_NAMES.PACKAGE : SHEET_NAMES.DOGMARU_EXCLUDE;

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
  };

  const handleCompanyClick = (companySheetId: string) => {
    router.push(`/sheets/${companySheetId}`);
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
        <div className="mb-6 flex gap-2">
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
