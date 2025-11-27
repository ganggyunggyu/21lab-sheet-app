'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useSheetData,
  useAddSheetRow,
  useUpdateSheetRow,
  useSyncVisibility,
  useColumnIndices,
} from '../lib';
import { useCompanyList } from '@/entities';

type FilterType = 'all' | 'visible' | 'empty';

interface SheetTableProps {
  sheetId: string;
  sheetName?: string;
  showNavigation?: boolean;
}

const extractSheetId = (url: string): string => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl.includes('/') && !trimmedUrl.includes('http')) {
    return trimmedUrl;
  }

  const match = trimmedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return trimmedUrl;
};

export const SheetTable = ({
  sheetId,
  sheetName,
  showNavigation = false,
}: SheetTableProps) => {
  const router = useRouter();
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newRow, setNewRow] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading, error } = useSheetData(sheetId, sheetName);
  const addMutation = useAddSheetRow(sheetId, sheetName);
  const updateMutation = useUpdateSheetRow(sheetId, sheetName);
  const syncMutation = useSyncVisibility();
  const { setCompanies } = useCompanyList();

  const {
    visibleColumnIndices,
    allHeaders,
    originalUrlColumnIndex,
    originalNameColumnIndex,
    originalVisibilityColumnIndex,
    originalKeywordColumnIndex,
  } = useColumnIndices(data?.data);

  const handleCellClick = (row: number, col: number, value: string) => {
    const originalCol = visibleColumnIndices[col];
    setEditingCell({ row, col: originalCol });
    setEditValue(value || '');
  };

  const handleCellSave = () => {
    if (!editingCell || !data?.data) return;

    const { row, col } = editingCell;
    let columnLetter = '';
    let tempCol = col + 1;
    while (tempCol > 0) {
      const remainder = (tempCol - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      tempCol = Math.floor((tempCol - 1) / 26);
    }
    const range = `${columnLetter}${row + 1}`;

    const isVisibilityColumn = col === originalVisibilityColumnIndex;
    const isMainPage = showNavigation;
    const isVisibilityChecked = editValue.toLowerCase() === 'o';

    updateMutation.mutate(
      {
        sheetId,
        range,
        values: [[editValue]],
        sheetName,
      },
      {
        onSuccess: () => {
          setEditingCell(null);

          if (isMainPage && isVisibilityColumn && isVisibilityChecked) {
            const currentRow = data.data[row];
            const companySheetUrl = currentRow[originalUrlColumnIndex];
            const keyword = currentRow[originalKeywordColumnIndex];

            if (!companySheetUrl || !keyword) {
              toast.error('URL 또는 키워드가 없어서 동기화 못함');
              return;
            }

            const companySheetId = extractSheetId(companySheetUrl);

            syncMutation.mutate(
              { sheetId: companySheetId, keyword },
              {
                onSuccess: (response) => {
                  if (response.success) {
                    toast.success(
                      `동기화 성공! (${response.summary.success}/${response.summary.total} 탭)`
                    );
                  } else {
                    toast.error('동기화 실패함');
                  }
                },
                onError: () => {
                  toast.error('동기화 요청 실패했어');
                },
              }
            );
          }
        },
      }
    );
  };

  const handleAddRow = () => {
    if (newRow.length === 0 || !data?.data?.[0]) return;

    const columnCount = allHeaders.length;
    const filledRow = Array(columnCount).fill('');

    visibleColumnIndices.forEach((originalIndex, displayIndex) => {
      filledRow[originalIndex] = newRow[displayIndex] || '';
    });

    addMutation.mutate(
      {
        sheetId,
        values: [filledRow],
        sheetName,
      },
      {
        onSuccess: () => {
          setNewRow([]);
        },
      }
    );
  };

  const sheetData = useMemo(() => data?.data || [], [data]);
  const allRows = useMemo(() => sheetData.slice(1), [sheetData]);

  const headers = visibleColumnIndices.map((i) => allHeaders[i]);
  const urlColumnIndex = visibleColumnIndices.indexOf(originalUrlColumnIndex);
  React.useEffect(() => {
    if (
      showNavigation &&
      allRows.length > 0 &&
      originalUrlColumnIndex !== -1 &&
      originalNameColumnIndex !== -1
    ) {
      const companies = allRows
        .filter((row) => row[originalUrlColumnIndex] && row[originalNameColumnIndex])
        .map((row) => ({
          name: row[originalNameColumnIndex],
          sheetId: extractSheetId(row[originalUrlColumnIndex]),
        }));
      setCompanies(companies);
    }
  }, [showNavigation, allRows, originalUrlColumnIndex, originalNameColumnIndex, setCompanies]);

  const filteredRows = allRows.filter((row) => {
    if (filter === 'all') return true;

    const visibilityValue = row[originalVisibilityColumnIndex] || '';

    if (filter === 'visible') {
      return visibilityValue.toLowerCase() === 'o';
    }

    if (filter === 'empty') {
      return visibilityValue.trim() === '';
    }

    return true;
  });

  const rows = filteredRows.map((row) =>
    visibleColumnIndices.map((i) => row[i] || '')
  );

  const handleSheetLinkClick = (url: string) => {
    if (url && url.trim()) {
      const sheetIdExtracted = extractSheetId(url);
      router.push(`/sheets/${sheetIdExtracted}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          불러오는 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          에러: {String(error)}
        </p>
      </div>
    );
  }

  if (sheetData.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          데이터가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          필터:
        </span>
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          전체 ({allRows.length})
        </button>
        <button
          onClick={() => setFilter('visible')}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'visible'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          노출 (O)
        </button>
        <button
          onClick={() => setFilter('empty')}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'empty'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          미노출
        </button>
        {filter !== 'all' && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {rows.length}개 표시 중
          </span>
        )}
      </div>

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
                    const originalColIndex = visibleColumnIndices[colIndex];
                    const isEditing =
                      editingCell?.row === rowIndex + 1 &&
                      editingCell?.col === originalColIndex;

                    const isUrlColumn = colIndex === urlColumnIndex;

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
                                target.style.height =
                                  target.scrollHeight + 'px';
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
                              handleCellClick(rowIndex + 1, colIndex, cellValue)
                            }
                            className="min-h-8 min-w-20 max-w-xs cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis px-2 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            {cellValue || ''}
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

      <div className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          새 행 추가
        </h3>
        <div className="mb-4 max-w-full overflow-x-auto">
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
              <tr>
                {headers.map((_, i) => (
                  <td
                    key={i}
                    className="border border-gray-300 dark:border-gray-700 p-0"
                  >
                    <textarea
                      value={newRow[i] || ''}
                      onChange={(e) => {
                        const updated = [...newRow];
                        updated[i] = e.target.value;
                        setNewRow(updated);
                      }}
                      className="min-w-20 w-full resize-none bg-white dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:bg-blue-50 dark:focus:bg-blue-900/30"
                      placeholder=""
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={handleAddRow}
          disabled={addMutation.isPending}
          className="rounded bg-green-600 dark:bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
        >
          {addMutation.isPending ? '추가 중...' : '행 추가'}
        </button>
      </div>
    </div>
  );
};
