'use client';

import { useAtom } from 'jotai';
import { ChevronDown } from 'lucide-react';
import {
  isRootOpenAtom,
  isImportOpenAtom,
  isExportOpenAtom,
  isSyncingAtom,
  importModeAtom,
} from '@/shared/model/sheet.store';
import { useSheetSync, useRootKeywords } from '../lib';
import { clearColsAtoG } from '@/lib/google-sheets';

export const SheetActions = () => {
  const [isRootOpen, setIsRootOpen] = useAtom(isRootOpenAtom);
  const [isImportOpen, setIsImportOpen] = useAtom(isImportOpenAtom);
  const [isExportOpen, setIsExportOpen] = useAtom(isExportOpenAtom);
  const [isSyncing] = useAtom(isSyncingAtom);
  const [importMode, setImportMode] = useAtom(importModeAtom);

  const { handleImportFromDB, handleExportChoice } = useSheetSync();
  const { handleMatchRootCompany, handleRemoveRootCompany } = useRootKeywords();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          테스트:
        </span>
        <button
          onClick={() =>
            setImportMode(importMode === 'update' ? 'rewrite' : 'update')
          }
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            importMode === 'update'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
          }`}
        >
          {importMode === 'update' ? '노출여부만' : '전체재작성'}
        </button>
      </div>
      {/* 루트 드롭다운 */}
      <div
        className="relative"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsRootOpen(false);
          }
        }}
      >
        <button
          onClick={() => setIsRootOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          aria-expanded={isRootOpen}
          aria-haspopup="menu"
        >
          루트
          <ChevronDown size={16} />
        </button>
        {isRootOpen && (
          <div
            className="absolute left-0 z-20 mt-2 w-40 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            role="menu"
          >
            <button
              onClick={handleMatchRootCompany}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              업체명 적용
            </button>
            <button
              onClick={handleRemoveRootCompany}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              업체명 제거
            </button>
          </div>
        )}
      </div>

      {/* 노출현황 드롭다운 */}
      <div
        className="relative"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsImportOpen(false);
          }
        }}
      >
        <button
          onClick={() => setIsImportOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          aria-expanded={isImportOpen}
          aria-haspopup="menu"
        >
          노출현황
          <ChevronDown size={16} />
        </button>
        {isImportOpen && (
          <div
            className="absolute left-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            role="menu"
          >
            <button
              onClick={() => {
                setIsImportOpen(false);
                handleImportFromDB('current');
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              현재 탭
            </button>
            <button
              onClick={() => {
                setIsImportOpen(false);
                handleImportFromDB('all');
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              전체 탭
            </button>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => {
                setIsImportOpen(false);
                handleImportFromDB('root-import');
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              루트 임포트
            </button>
          </div>
        )}
      </div>

      {/* 내보내기 드롭다운 */}
      <div
        className="relative"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsExportOpen(false);
          }
        }}
      >
        <button
          onClick={() => setIsExportOpen((v) => !v)}
          disabled={isSyncing}
          className="inline-flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600"
          aria-expanded={isExportOpen}
          aria-haspopup="menu"
        >
          내보내기
          <ChevronDown size={16} />
        </button>
        {isExportOpen && (
          <div
            className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            role="menu"
          >
            <button
              onClick={() => handleExportChoice('current')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              현재 탭 내보내기
            </button>
            <button
              onClick={() => handleExportChoice('all')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              전체 내보내기
            </button>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={() => handleExportChoice('package')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              패키지만
            </button>
            <button
              onClick={() => handleExportChoice('dogmaru')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              도그마루만
            </button>
            <button
              onClick={() => handleExportChoice('dogmaru-exclude')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              도그마루 제외만
            </button>
            <button
              onClick={() => handleExportChoice('pet')}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              애견만
            </button>
            <button
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              시트지우기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
