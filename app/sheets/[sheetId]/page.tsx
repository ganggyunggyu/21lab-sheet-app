'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SheetTable, ThemeToggle, useSpreadsheetMetadata } from '@/features';
import { ArrowLeft } from 'lucide-react';

export default function SheetPage() {
  const router = useRouter();
  const params = useParams();
  const sheetId = params.sheetId as string;
  const [activeSheetName, setActiveSheetName] = useState<string | undefined>(undefined);

  const { data: metadata, isLoading: isLoadingMetadata } = useSpreadsheetMetadata(sheetId);

  const handleBack = () => {
    router.push('/');
  };

  const handleTabChange = (sheetName: string) => {
    setActiveSheetName(sheetName);
  };

  const sheets = metadata?.sheets || [];
  const currentSheetName = activeSheetName || sheets[0]?.title;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="메인으로 돌아가기"
            >
              <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-xl font-normal text-gray-900 dark:text-white">
              Google Sheets Manager
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="p-6">
        {isLoadingMetadata ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              불러오는 중...
            </p>
          </div>
        ) : sheets.length > 1 ? (
          <>
            <div className="mb-6 flex gap-2">
              {sheets.map((sheet) => (
                <button
                  key={sheet.sheetId}
                  onClick={() => handleTabChange(sheet.title)}
                  className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
                    currentSheetName === sheet.title
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {sheet.title}
                </button>
              ))}
            </div>
            <SheetTable sheetId={sheetId} sheetName={currentSheetName} showNavigation={false} />
          </>
        ) : (
          <SheetTable sheetId={sheetId} sheetName={currentSheetName} showNavigation={false} />
        )}
      </div>
    </div>
  );
}
