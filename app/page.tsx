'use client';

import { useAtom } from 'jotai';
import { SheetTable } from '@/features';
import {
  PageHeader,
  SheetTabs,
  SheetActions,
  CompanyList,
} from '@/features/sheet-sync';
import { activeTabAtom } from '@/shared/model/sheet.store';
import { cn } from '@/shared';
import {
  PRODUCTION_CONFIG,
  getSheetNameByType,
} from '@/shared/constants/sheet';

export default function Home() {
  const [activeTab] = useAtom(activeTabAtom);
  const currentSheetName = getSheetNameByType(activeTab);

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        'bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900',
        'dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-50'
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0')}>
        <div
          className={cn(
            'absolute -left-24 top-[-10%] h-72 w-72 rounded-full bg-sky-400/25 blur-3xl',
            'dark:bg-sky-500/25'
          )}
        />
        <div
          className={cn(
            'absolute right-[-12%] top-10 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl',
            'dark:bg-indigo-600/25'
          )}
        />
        <div
          className={cn(
            'absolute inset-x-0 bottom-[-20%] h-64 bg-gradient-to-t from-slate-200/50 to-transparent',
            'dark:from-slate-900/50'
          )}
        />
      </div>

      <div className={cn('relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-8')}>
        <PageHeader />

        <div className={cn('mt-6 grid gap-4 lg:grid-cols-[1.7fr,1fr]')}>
          <SheetTabs />
          <SheetActions />
        </div>

        <div className={cn('mt-4')}>
          <CompanyList />
        </div>

        <div className={cn('mt-6')}>
          <SheetTable
            sheetId={PRODUCTION_CONFIG.SHEET_ID}
            sheetName={currentSheetName}
            showNavigation={true}
          />
        </div>
      </div>
    </div>
  );
}
