'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  extractSheetId,
  toColumnLetter,
  useAddSheetRow,
  useColumnIndices,
  useSheetData,
  useSyncVisibility,
  useUpdateSheetRow,
} from '@/features/sheet-table/lib';
import { SheetTableAddRow } from '@/features/sheet-table/ui/SheetTableAddRow';
import { SheetTableFilters } from '@/features/sheet-table/ui/SheetTableFilters';
import { SheetTableGrid } from '@/features/sheet-table/ui/SheetTableGrid';
import type { EditingCell, FilterType } from '@/features/sheet-table/ui/types';
import { useCompanyList } from '@/entities';
import { cn } from '@/shared';

interface SheetTableProps {
  sheetId: string;
  sheetName?: string;
  showNavigation?: boolean;
}

export const SheetTable = ({
  sheetId,
  sheetName,
  showNavigation = false,
}: SheetTableProps) => {
  const router = useRouter();
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState('');
  const [newRow, setNewRow] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading, error } = useSheetData(sheetId, sheetName);
  const addMutation = useAddSheetRow(sheetId, sheetName);
  const updateMutation = useUpdateSheetRow(sheetId, sheetName);
  const syncMutation = useSyncVisibility();
  const { setCompanies } = useCompanyList();

  const sheetData = useMemo(() => data?.data || [], [data]);

  const {
    visibleColumnIndices,
    allHeaders,
    originalUrlColumnIndex,
    originalNameColumnIndex,
    originalVisibilityColumnIndex,
    originalKeywordColumnIndex,
  } = useColumnIndices(sheetData);

  const headers = useMemo(
    () => visibleColumnIndices.map((index) => allHeaders[index]),
    [visibleColumnIndices, allHeaders]
  );

  const allRows = useMemo(() => sheetData.slice(1), [sheetData]);

  const urlColumnIndex = useMemo(
    () => visibleColumnIndices.indexOf(originalUrlColumnIndex),
    [visibleColumnIndices, originalUrlColumnIndex]
  );

  useEffect(() => {
    if (
      !showNavigation ||
      allRows.length === 0 ||
      originalUrlColumnIndex === -1 ||
      originalNameColumnIndex === -1
    ) {
      return;
    }

    const companies = allRows
      .filter((row) => row[originalUrlColumnIndex] && row[originalNameColumnIndex])
      .map((row) => ({
        name: row[originalNameColumnIndex],
        sheetId: extractSheetId(row[originalUrlColumnIndex]),
      }));

    setCompanies(companies);
  }, [
    showNavigation,
    allRows,
    originalUrlColumnIndex,
    originalNameColumnIndex,
    setCompanies,
  ]);

  const filteredRows = useMemo(() => {
    if (filter === 'all') {
      return allRows;
    }

    return allRows.filter((row) => {
      const visibilityValue = row[originalVisibilityColumnIndex] || '';

      if (filter === 'visible') {
        return visibilityValue.toLowerCase() === 'o';
      }

      if (filter === 'empty') {
        return visibilityValue.trim() === '';
      }

      return true;
    });
  }, [allRows, filter, originalVisibilityColumnIndex]);

  const rows = useMemo(
    () =>
      filteredRows.map((row) =>
        visibleColumnIndices.map((index) => row[index] || '')
      ),
    [filteredRows, visibleColumnIndices]
  );

  const handleCellClick = (row: number, col: number, value: string) => {
    const originalCol = visibleColumnIndices[col];
    setEditingCell({ row, col: originalCol });
    setEditValue(value || '');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
  };

  const handleVisibilitySync = (currentRow: string[]) => {
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
  };

  const handleCellSave = () => {
    if (!editingCell || sheetData.length === 0) return;

    const { row, col } = editingCell;
    const range = `${toColumnLetter(col)}${row + 1}`;
    const isVisibilityColumn = col === originalVisibilityColumnIndex;
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

          if (showNavigation && isVisibilityColumn && isVisibilityChecked) {
            const currentRow = sheetData[row];
            if (!currentRow) return;

            handleVisibilitySync(currentRow);
          }
        },
      }
    );
  };

  const handleAddRow = () => {
    if (newRow.length === 0 || allHeaders.length === 0) return;

    const filledRow = Array(allHeaders.length).fill('');

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

  const handleNewRowChange = (index: number, value: string) => {
    setNewRow((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSheetLinkClick = (url: string) => {
    if (!url || !url.trim()) return;

    const sheetIdExtracted = extractSheetId(url);
    router.push(`/sheets/${sheetIdExtracted}`);
  };

  const tableShellClassName = cn(
    'rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-xl shadow-sky-100/70 backdrop-blur-sm',
    'dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-none'
  );

  if (isLoading) {
    return (
      <div className={tableShellClassName}>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 py-12 text-center'
          )}
        >
          <div
            className={cn(
              'h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500',
              'dark:border-slate-700 dark:border-t-sky-400'
            )}
          />
          <p className={cn('text-sm text-slate-600 dark:text-slate-300')}>
            불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={tableShellClassName}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4',
            'text-sm text-rose-800 shadow-sm dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100'
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-700',
              'dark:bg-rose-700/30 dark:text-rose-100'
            )}
          >
            !
          </span>
          <p className={cn('flex-1')}>에러: {String(error)}</p>
        </div>
      </div>
    );
  }

  if (sheetData.length === 0) {
    return (
      <div className={tableShellClassName}>
        <div className={cn('py-12 text-center')}>
          <p className={cn('text-sm text-slate-600 dark:text-slate-400')}>
            데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={tableShellClassName}>
      <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between')}>
        <div className={cn('space-y-1')}>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400'
            )}
          >
            데이터 테이블
          </p>
          <h2 className={cn('text-xl font-semibold text-slate-900 dark:text-slate-50')}>
            {sheetName || 'Google Sheet'}
          </h2>
          <div className={cn('flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300')}>
            <span
              className={cn(
                'rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-slate-800'
              )}
            >
              전체 {allRows.length}행
            </span>
            <span
              className={cn(
                'rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-slate-800'
              )}
            >
              표시 {rows.length}행
            </span>
            {showNavigation && (
              <span
                className={cn(
                  'rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800',
                  'dark:bg-sky-900/60 dark:text-sky-100'
                )}
              >
                링크 네비게이션 활성화
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm',
            'dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200'
          )}
        >
          탭 데이터 편집 시 자동 동기화 옵션이 켜져 있어. 신중하게 다뤄줘.
        </div>
      </div>

      <div className={cn('mt-4 space-y-5')}>
        <SheetTableFilters
          filter={filter}
          allRowsCount={allRows.length}
          filteredRowsCount={rows.length}
          onFilterChange={setFilter}
        />
        <SheetTableGrid
          headers={headers}
          rows={rows}
          visibleColumnIndices={visibleColumnIndices}
          editingCell={editingCell}
          editValue={editValue}
          urlColumnIndex={urlColumnIndex}
          onEditValueChange={setEditValue}
          onEditCancel={handleEditCancel}
          onCellSave={handleCellSave}
          onCellClick={handleCellClick}
          onSheetLinkClick={handleSheetLinkClick}
        />
        <SheetTableAddRow
          headers={headers}
          newRow={newRow}
          isAdding={addMutation.isPending}
          onAddRow={handleAddRow}
          onNewRowChange={handleNewRowChange}
        />
      </div>
    </div>
  );
};
