'use client';

import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/features';
import { cn } from '@/shared';

export const PageHeader = () => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-200/70',
        'bg-gradient-to-br from-sky-100 via-white to-slate-100 text-slate-900 shadow-2xl shadow-sky-100/70',
        'dark:border-slate-800/60 dark:from-slate-900 dark:via-slate-950 dark:to-black dark:text-slate-50'
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0')}>
        <div
          className={cn(
            'absolute left-10 top-6 h-32 w-32 rounded-full bg-white/40 blur-2xl',
            'dark:bg-sky-500/25'
          )}
        />
        <div
          className={cn(
            'absolute right-6 top-[-8%] h-44 w-44 rounded-full bg-sky-300/40 blur-3xl',
            'dark:bg-indigo-600/25'
          )}
        />
        <div
          className={cn(
            'absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent',
            'dark:via-slate-700'
          )}
        />
      </div>
      <div
        className={cn(
          'relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:justify-between'
        )}
      >
        <div className={cn('space-y-3')}>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-800 backdrop-blur-sm',
              'dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full bg-emerald-500 animate-pulse')} />
            실시간 시트 컨트롤
          </div>
          <div>
            <h1
              className={cn(
                'text-3xl font-semibold leading-tight tracking-tight sm:text-3xl'
              )}
            >
              Google Sheets Manager
            </h1>
            <p className={cn('mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300')}>
              시트에서 DB까지, 노출 여부와 루트 키워드까지 한 화면에서 다루는 운영 대시보드야.
            </p>
          </div>
          <div className={cn('flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300')}>
            <span
              className={cn(
                'rounded-full bg-white/80 px-3 py-1 font-medium shadow-sm dark:bg-slate-800/80'
              )}
            >
              시트 ↔ Mongo 동기화
            </span>
            <span
              className={cn(
                'rounded-full bg-white/80 px-3 py-1 font-medium shadow-sm dark:bg-slate-800/80'
              )}
            >
              탭별 노출 관리
            </span>
            <span
              className={cn(
                'rounded-full bg-white/80 px-3 py-1 font-medium shadow-sm dark:bg-slate-800/80'
              )}
            >
              루트 키워드 매칭
            </span>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-3 self-start rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-md backdrop-blur-md',
            'dark:border-slate-800 dark:bg-slate-900/70'
          )}
        >
          <button
            onClick={() => router.push('/root-gunba')}
            className={cn(
              'rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-400/30 transition',
              'hover:-translate-y-0.5 hover:shadow-slate-500/50 dark:bg-white dark:text-slate-900'
            )}
          >
            Root Gunba
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
