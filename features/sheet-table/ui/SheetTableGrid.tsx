'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared';
import type { EditingCell } from '@/features/sheet-table/ui/types';

interface SheetTableGridProps {
  headers: string[];
  rows: string[][];
  visibleColumnIndices: number[];
  editingCell: EditingCell;
  editValue: string;
  urlColumnIndex: number;
  onEditValueChange: (value: string) => void;
  onEditCancel: () => void;
  onCellSave: () => void;
  onCellClick: (row: number, col: number, value: string) => void;
  onSheetLinkClick: (url: string) => void;
}

const handleAutoResize = (event: React.FormEvent<HTMLTextAreaElement>) => {
  const { currentTarget } = event;
  currentTarget.style.height = 'auto';
  currentTarget.style.height = `${currentTarget.scrollHeight}px`;
};

export const SheetTableGrid = ({
  headers,
  rows,
  visibleColumnIndices,
  editingCell,
  editValue,
  urlColumnIndex,
  onEditValueChange,
  onEditCancel,
  onCellSave,
  onCellClick,
  onSheetLinkClick,
}: SheetTableGridProps) => {
  const handleEditChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    onEditValueChange(value);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm',
        'dark:border-slate-700 dark:bg-slate-900/70'
      )}
    >
      <div className={cn('max-w-full overflow-x-auto')}>
        <table className={cn('w-full border-collapse text-sm')}>
          <thead>
            <tr
              className={cn(
                'bg-gradient-to-r from-slate-900 to-slate-800 text-left text-xs text-white',
                'dark:from-slate-800 dark:to-slate-900'
              )}
            >
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  className={cn(
                    'min-w-[6rem] whitespace-nowrap px-3 py-3 font-semibold',
                    index === 0 ? 'rounded-tl-2xl' : '',
                    index === headers.length - 1 ? 'rounded-tr-2xl' : ''
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b border-slate-100/80 transition last:border-0',
                  'odd:bg-white/90 even:bg-slate-50/80 hover:bg-slate-100/80',
                  'dark:border-slate-800/70 dark:odd:bg-slate-900/80 dark:even:bg-slate-800/70 dark:hover:bg-slate-800'
                )}
              >
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
                      className={cn(
                        'border-r border-slate-100/80 p-0 last:border-r-0',
                        'dark:border-slate-800/70'
                      )}
                    >
                      {isEditing ? (
                        <div
                          className={cn(
                            'flex items-center gap-2 rounded-lg bg-slate-900/5 p-2',
                            'dark:bg-slate-800/60'
                          )}
                        >
                          <textarea
                            value={editValue}
                            onChange={handleEditChange}
                          className={cn(
                            'min-h-[36px] flex-1 resize-none rounded-md border border-slate-200 bg-white',
                            'px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100',
                            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/60'
                          )}
                            autoFocus
                            rows={1}
                            onInput={handleAutoResize}
                          />
                          <button
                            onClick={onCellSave}
                            className={cn(
                              'rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition',
                              'hover:-translate-y-0.5 hover:bg-emerald-600'
                            )}
                          >
                            저장
                          </button>
                          <button
                            onClick={onEditCancel}
                            className={cn(
                              'rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition',
                              'hover:-translate-y-0.5 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                            )}
                          >
                            취소
                          </button>
                        </div>
                      ) : isUrlColumn && cellValue ? (
                        <div className={cn('flex items-center justify-center px-2 py-2')}>
                          <button
                            onClick={() => onSheetLinkClick(cellValue)}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sky-700 transition',
                              'hover:-translate-y-0.5 hover:bg-sky-100',
                              'dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700'
                            )}
                            title="시트로 이동"
                          >
                            링크
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => onCellClick(rowIndex + 1, colIndex, cellValue)}
                          className={cn(
                            'min-h-[40px] min-w-[6rem] max-w-xs cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap',
                            'px-3 py-2 text-sm text-slate-900 transition',
                            'hover:bg-slate-200/60',
                            'dark:text-slate-100 dark:hover:bg-slate-800'
                          )}
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
  );
};
