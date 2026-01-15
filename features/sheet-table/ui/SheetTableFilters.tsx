'use client';

import { cn } from '@/shared';
import type { FilterType } from '@/features/sheet-table/ui/types';

interface SheetTableFiltersProps {
  filter: FilterType;
  allRowsCount: number;
  filteredRowsCount: number;
  onFilterChange: (filter: FilterType) => void;
}

const getFilterButtonClassName = (isActive: boolean) =>
  cn(
    'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
    'border-slate-200/80 bg-white/80 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100',
    isActive &&
      'border-transparent bg-gradient-to-r from-sky-600 to-indigo-500 text-white shadow-lg shadow-sky-400/40'
  );

export const SheetTableFilters = ({
  filter,
  allRowsCount,
  filteredRowsCount,
  onFilterChange,
}: SheetTableFiltersProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 shadow-sm',
        'dark:border-slate-800/70 dark:bg-slate-800/60'
      )}
    >
      <div className={cn('flex flex-wrap items-center gap-3')}>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm',
            'dark:bg-slate-900/70 dark:text-slate-100'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full bg-sky-500')} />
          필터링
        </div>
        <div className={cn('flex flex-wrap gap-2')}>
          <button
            onClick={() => onFilterChange('all')}
            className={getFilterButtonClassName(filter === 'all')}
          >
            전체 ({allRowsCount})
          </button>
          <button
            onClick={() => onFilterChange('visible')}
            className={getFilterButtonClassName(filter === 'visible')}
          >
            노출 (O)
          </button>
          <button
            onClick={() => onFilterChange('empty')}
            className={getFilterButtonClassName(filter === 'empty')}
          >
            미노출
          </button>
        </div>
        {filter !== 'all' && (
          <span className={cn('text-sm font-semibold text-slate-600 dark:text-slate-300')}>
            {filteredRowsCount}개 표시 중
          </span>
        )}
      </div>
    </div>
  );
};
