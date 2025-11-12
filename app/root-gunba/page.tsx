'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle, useSheetData, useUpdateSheetRow } from '@/features';
import { ArrowLeft, ExternalLink, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const SHEET_ID = '1CsO-R1LMrsQdUw7T1KEL2I4bMxAeYnZIklOgr8e_DPY';

const extractSheetId = (url: string): string => {
  const trimmedUrl = url?.trim() || '';

  if (!trimmedUrl.includes('/') && !trimmedUrl.includes('http')) {
    return trimmedUrl;
  }

  const match = trimmedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return trimmedUrl;
};

export default function RootGunbaPage() {
  const router = useRouter();
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, error } = useSheetData(SHEET_ID);
  const updateMutation = useUpdateSheetRow(SHEET_ID);

  const { headers, rows, headerRowIndex, keywordColumnIndex, companyColumnIndex } = useMemo(() => {
    const sheetData = data?.data || [];

    const headerIdx = sheetData.findIndex(
      (row) => row && row.length > 0 && row.some((cell) => cell && cell.trim())
    );

    if (headerIdx === -1) {
      return { headers: [], rows: [], headerRowIndex: -1, keywordColumnIndex: -1, companyColumnIndex: -1 };
    }

    const foundHeaders = sheetData[headerIdx] || [];
    const rawDataRows = sheetData.slice(headerIdx + 1);

    const keywordIdx = foundHeaders.findIndex(
      (header) => header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
    );
    const companyIdx = foundHeaders.findIndex(
      (header) => header?.toLowerCase() === '업체명' || header?.toLowerCase().includes('업체')
    );

    let currentCompany = '';
    const processedRows = rawDataRows.map((row) => {
      const newRow = [...row];

      if (companyIdx !== -1) {
        if (newRow[companyIdx] && newRow[companyIdx].trim()) {
          currentCompany = newRow[companyIdx].trim();
        } else {
          newRow[companyIdx] = currentCompany;
        }
      }

      return newRow;
    });

    return {
      headers: foundHeaders,
      rows: processedRows,
      headerRowIndex: headerIdx,
      keywordColumnIndex: keywordIdx,
      companyColumnIndex: companyIdx,
    };
  }, [data]);

  const urlColumnIndex = headers.findIndex(
    (header) => header?.toLowerCase().includes('시트') && header?.toLowerCase().includes('링크')
  );

  console.log('📊 processed rows:', rows.map((row, idx) => ({
    index: idx,
    keyword: row[keywordColumnIndex],
    company: row[companyColumnIndex],
    formatted: `${row[keywordColumnIndex]}(${row[companyColumnIndex]})`
  })));

  const handleBack = () => {
    router.push('/');
  };

  const handleCellClick = (row: number, col: number, value: string) => {
    setEditingCell({ row, col });
    setEditValue(value || '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    const actualRow = headerRowIndex + 1 + row + 1;

    let columnLetter = '';
    let tempCol = col + 1;
    while (tempCol > 0) {
      const remainder = (tempCol - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      tempCol = Math.floor((tempCol - 1) / 26);
    }
    const range = `${columnLetter}${actualRow}`;

    updateMutation.mutate(
      {
        sheetId: SHEET_ID,
        range,
        values: [[editValue]],
      },
      {
        onSuccess: () => {
          setEditingCell(null);
          toast.success('수정 완료!');
        },
        onError: () => {
          toast.error('수정 실패');
        },
      }
    );
  };

  const handleSheetLinkClick = (url: string) => {
    if (url && url.trim()) {
      const sheetIdExtracted = extractSheetId(url);
      router.push(`/sheets/${sheetIdExtracted}`);
    }
  };

  const handleSyncToDB = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/root-keywords/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetId: SHEET_ID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '동기화 실패');
      }

      const result = await response.json();
      toast.success(
        `DB 동기화 완료! (삭제: ${result.deleted}, 삽입: ${result.inserted})`
      );
    } catch (error) {
      console.error('동기화 에러:', error);
      toast.error(
        `동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 에러'}`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
              </button>
              <h1 className="text-xl font-normal text-gray-900 dark:text-white">
                Root Gunba
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="p-6">
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
              </button>
              <h1 className="text-xl font-normal text-gray-900 dark:text-white">
                Root Gunba
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="p-6">
          <div className="rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              에러: {String(error)}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Root Gunba
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncToDB}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded bg-blue-600 dark:bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              title="DB와 동기화"
            >
              <Database size={16} />
              {isSyncing ? '동기화 중...' : 'DB 동기화'}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-6">
        {headers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              데이터가 없습니다.
            </p>
          </div>
        ) : (
          <div className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-full overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="min-w-20 whitespace-nowrap border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 px-2 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((_, colIndex) => {
                        const cellValue = row[colIndex] || '';
                        const isEditing =
                          editingCell?.row === rowIndex &&
                          editingCell?.col === colIndex;

                        const isUrlColumn = colIndex === urlColumnIndex;
                        const isKeywordColumn = colIndex === keywordColumnIndex;

                        const displayValue = isKeywordColumn && keywordColumnIndex !== -1 && companyColumnIndex !== -1
                          ? `${cellValue}(${row[companyColumnIndex] || ''})`
                          : cellValue;

                        return (
                          <td
                            key={colIndex}
                            className="border border-gray-300 dark:border-gray-700 p-0"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1 p-1">
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="min-h-7 flex-1 resize-none border border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 text-sm outline-none"
                                  autoFocus
                                  rows={1}
                                  onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                  }}
                                />
                                <button
                                  onClick={handleCellSave}
                                  className="rounded bg-green-600 dark:bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-700 dark:hover:bg-green-600"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="rounded bg-gray-500 dark:bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-600 dark:hover:bg-gray-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : isUrlColumn && cellValue ? (
                              <div className="flex items-center justify-center px-2 py-2">
                                <button
                                  onClick={() => handleSheetLinkClick(cellValue)}
                                  className="rounded p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  title="시트로 이동"
                                >
                                  <ExternalLink size={16} />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  handleCellClick(rowIndex, colIndex, cellValue)
                                }
                                className="min-h-8 min-w-20 max-w-xs cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis px-2 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              >
                                {displayValue || ''}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
