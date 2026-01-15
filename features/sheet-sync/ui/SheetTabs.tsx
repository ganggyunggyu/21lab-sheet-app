'use client';

import { useAtom } from 'jotai';
import { activeTabAtom } from '@/shared/model/sheet.store';
import { getTabLabel, type MainTab } from '@/shared/constants/sheet';
import { cn } from '@/shared';

const tabs: MainTab[] = ['package', 'dogmaru-exclude', 'dogmaru'];
const tabDescriptions: Record<MainTab, string> = {
  package: '패키지 기준 정리',
  'dogmaru-exclude': '도그마루 제외',
  dogmaru: '도그마루 집중',
};

export const SheetTabs = () => {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-lg shadow-sky-100/60 backdrop-blur-sm',
        'dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-none'
      )}
    >
      <div className={cn('flex flex-col gap-3 md:flex-row md:items-center md:justify-between')}>
        <div className={cn('space-y-1')}>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400'
            )}
          >
            탭 셀렉터
          </p>
          <p className={cn('text-sm text-slate-700 dark:text-slate-300')}>
            도메인별로 다른 시트를 바로 불러와. 헷갈릴 일 없지?
          </p>
        </div>
        <div className={cn('flex flex-1 flex-wrap justify-end gap-2 md:flex-nowrap')}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'group relative min-w-[120px] flex-1 overflow-hidden rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all',
                  'border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
                  'dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100',
                  isActive &&
                    'border-transparent bg-gradient-to-r from-sky-600 to-indigo-500 text-white shadow-lg shadow-sky-400/40 dark:shadow-sky-700/40'
                )}
              >
                <span className={cn('block text-sm')}>{getTabLabel(tab)}</span>
                <span
                  className={cn(
                    'mt-1 block text-[11px] font-medium text-slate-500 transition',
                    'dark:text-slate-300',
                    isActive && 'text-white/80'
                  )}
                >
                  {tabDescriptions[tab]}
                </span>
                {isActive && (
                  <span
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br from-white/15 via-white/0 to-white/5',
                      'dark:from-white/10 dark:via-white/0 dark:to-white/5'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
