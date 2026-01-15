'use client';

import React from 'react';
import { cn } from '@/shared';

interface SheetTableAddRowProps {
  headers: string[];
  newRow: string[];
  isAdding: boolean;
  onAddRow: () => void;
  onNewRowChange: (index: number, value: string) => void;
}

const handleAutoResize = (event: React.FormEvent<HTMLTextAreaElement>) => {
  const { currentTarget } = event;
  currentTarget.style.height = 'auto';
  currentTarget.style.height = `${currentTarget.scrollHeight}px`;
};

export const SheetTableAddRow = ({
  headers,
  newRow,
  isAdding,
  onAddRow,
  onNewRowChange,
}: SheetTableAddRowProps) => {
  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    onNewRowChange(index, value);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 shadow-sm',
        'dark:border-slate-800/70 dark:bg-slate-800/70'
      )}
    >
      <div className={cn('mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
        <div className={cn('space-y-1')}>
          <h3 className={cn('text-base font-semibold text-slate-900 dark:text-slate-50')}>
            새 행 추가
          </h3>
          <p className={cn('text-xs text-slate-600 dark:text-slate-300')}>
            바로 아래에 값 채워 넣고 버튼만 누르면 끝이야.
          </p>
        </div>
        <button
          onClick={onAddRow}
          disabled={isAdding}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition',
            'hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-200',
            'disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
          )}
        >
          {isAdding ? '추가 중...' : '행 추가'}
        </button>
      </div>
      <div className={cn('max-w-full overflow-x-auto rounded-xl border border-slate-200/70 bg-white/90 shadow-inner dark:border-slate-700 dark:bg-slate-900/70')}>
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
                    'min-w-[6rem] whitespace-nowrap px-3 py-2 font-semibold',
                    index === 0 ? 'rounded-tl-xl' : '',
                    index === headers.length - 1 ? 'rounded-tr-xl' : ''
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {headers.map((_, index) => (
                <td
                  key={index}
                  className={cn(
                    'border-r border-slate-200/80 bg-white/80 p-0 last:border-r-0',
                    'dark:border-slate-700 dark:bg-slate-900/70'
                  )}
                >
                  <textarea
                    value={newRow[index] || ''}
                    onChange={handleChange(index)}
                    className={cn(
                      'min-w-[6rem] w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none',
                      'focus:bg-sky-50 focus:ring-2 focus:ring-sky-100',
                      'dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-sky-900/60'
                    )}
                    rows={1}
                    onInput={handleAutoResize}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
