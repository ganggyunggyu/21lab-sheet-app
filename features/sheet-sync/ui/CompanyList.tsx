'use client';

import { useRouter } from 'next/navigation';
import { useCompanyList } from '@/entities';
import { cn } from '@/shared';

export const CompanyList = () => {
  const router = useRouter();
  const { companyList } = useCompanyList();

  if (companyList.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-sky-100/60 backdrop-blur-sm',
        'dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-none'
      )}
    >
      <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
        <div className={cn('space-y-1')}>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400'
            )}
          >
            회사 목록
          </p>
          <p className={cn('text-sm text-slate-700 dark:text-slate-300')}>
            시트 링크를 바로 열어서 탭을 돌아다녀 봐.
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm',
            'dark:bg-slate-800 dark:text-slate-100'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full bg-emerald-500')} />
          {companyList.length}개 연결됨
        </span>
      </div>
      <div className={cn('mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3')}>
        {companyList.map((company) => (
          <button
            key={company.sheetId}
            onClick={() => router.push(`/sheets/${company.sheetId}`)}
            className={cn(
              'group flex items-center justify-between rounded-2xl border border-slate-200/70',
              'bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition',
              'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
              'dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100'
            )}
          >
            <span>{company.name}</span>
            <span
              className={cn(
                'h-2 w-2 rounded-full bg-sky-500 transition group-hover:scale-125'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
