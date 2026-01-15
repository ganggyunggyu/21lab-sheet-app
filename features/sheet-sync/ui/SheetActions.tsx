'use client';

import { useAtom } from 'jotai';
import { ChevronDown } from 'lucide-react';
import {
  isRootOpenAtom,
  isImportOpenAtom,
  isExportOpenAtom,
  isSyncingAtom,
  importModeAtom,
} from '@/shared/model/sheet.store';
import { useSheetSync, useRootKeywords } from '../lib';
import { cn } from '@/shared';

export const SheetActions = () => {
  const [isRootOpen, setIsRootOpen] = useAtom(isRootOpenAtom);
  const [isImportOpen, setIsImportOpen] = useAtom(isImportOpenAtom);
  const [isExportOpen, setIsExportOpen] = useAtom(isExportOpenAtom);
  const [isSyncing] = useAtom(isSyncingAtom);
  const [importMode, setImportMode] = useAtom(importModeAtom);

  const { handleImportFromDB, handleExportChoice } = useSheetSync();
  const { handleMatchRootCompany, handleRemoveRootCompany } = useRootKeywords();

  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-lg shadow-sky-100/60 backdrop-blur-sm',
        'dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-none'
      )}
    >
      <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
        <div>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400'
            )}
          >
            동기화 컨트롤
          </p>
          <p className={cn('text-sm text-slate-700 dark:text-slate-300')}>
            루트 키워드, 노출 현황, 내보내기를 한 군데서 몰아주자.
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            )}
          />
          {isSyncing ? '동기화 중...' : '준비 완료'}
        </span>
      </div>

      <div className={cn('mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4')}>
        <div
          className={cn(
            'rounded-2xl border border-slate-900/10 bg-gradient-to-br from-slate-900 to-slate-800 p-3 text-white shadow-lg shadow-slate-500/30',
            'dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:shadow-slate-900/40',
            'sm:col-span-2 lg:col-span-1'
          )}
        >
          <div className={cn('flex items-center justify-between gap-2')}>
            <div className={cn('space-y-1')}>
              <p className={cn('text-[11px] uppercase tracking-[0.12em] text-white/70')}>
                임포트 모드
              </p>
              <p className={cn('text-sm font-semibold')}>
                {importMode === 'update' ? '노출 여부만 업데이트' : '전체 재작성'}
              </p>
            </div>
            <button
              onClick={() =>
                setImportMode(importMode === 'update' ? 'rewrite' : 'update')
              }
              className={cn(
                'rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30'
              )}
            >
              토글
            </button>
          </div>
        </div>

        <div
          className={cn('relative')}
          tabIndex={0}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsRootOpen(false);
            }
          }}
        >
          <button
            onClick={() => setIsRootOpen((value) => !value)}
            className={cn(
              'inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-amber-200/70',
              'bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-300/40 transition',
              'hover:-translate-y-0.5 hover:shadow-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-200/80'
            )}
            aria-expanded={isRootOpen}
            aria-haspopup="menu"
          >
            루트 키워드
            <ChevronDown size={16} />
          </button>
          {isRootOpen && (
            <div
              className={cn(
                'absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl',
                'dark:border-slate-700 dark:bg-slate-900'
              )}
              role="menu"
            >
              <button
                onClick={handleMatchRootCompany}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                업체명 적용
              </button>
              <button
                onClick={handleRemoveRootCompany}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                업체명 제거
              </button>
            </div>
          )}
        </div>

        <div
          className={cn('relative')}
          tabIndex={0}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsImportOpen(false);
            }
          }}
        >
          <button
            onClick={() => setIsImportOpen((value) => !value)}
            className={cn(
              'inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200/80',
              'bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition',
              'hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200',
              'dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100'
            )}
            aria-expanded={isImportOpen}
            aria-haspopup="menu"
          >
            노출 현황 가져오기
            <ChevronDown size={16} />
          </button>
          {isImportOpen && (
            <div
              className={cn(
                'absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl',
                'dark:border-slate-700 dark:bg-slate-900'
              )}
              role="menu"
            >
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  handleImportFromDB('current');
                }}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                현재 탭
              </button>
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  handleImportFromDB('all');
                }}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                전체 탭
              </button>
              <div className={cn('h-px bg-slate-200 dark:bg-slate-700')} />
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  handleImportFromDB('root-import');
                }}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                루트 임포트
              </button>
            </div>
          )}
        </div>

        <div
          className={cn('relative sm:col-span-2 lg:col-span-1')}
          tabIndex={0}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsExportOpen(false);
            }
          }}
        >
          <button
            onClick={() => setIsExportOpen((value) => !value)}
            disabled={isSyncing}
            className={cn(
              'inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-emerald-200/70',
              'bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition',
              'hover:-translate-y-0.5 hover:shadow-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-200',
              'disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-slate-200/60 disabled:bg-slate-200/80 disabled:text-slate-500 disabled:shadow-none',
              'dark:border-emerald-400/40'
            )}
            aria-expanded={isExportOpen}
            aria-haspopup="menu"
          >
            내보내기
            <ChevronDown size={16} />
          </button>
          {isExportOpen && (
            <div
              className={cn(
                'absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl',
                'dark:border-slate-700 dark:bg-slate-900'
              )}
              role="menu"
            >
              <button
                onClick={() => handleExportChoice('current')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                현재 탭 내보내기
              </button>
              <button
                onClick={() => handleExportChoice('all')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                전체 내보내기
              </button>
              <div className={cn('h-px bg-slate-200 dark:bg-slate-700')} />
              <button
                onClick={() => handleExportChoice('package')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                패키지만
              </button>
              <button
                onClick={() => handleExportChoice('dogmaru')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                도그마루만
              </button>
              <button
                onClick={() => handleExportChoice('dogmaru-exclude')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                도그마루 제외만
              </button>
              <button
                onClick={() => handleExportChoice('pet')}
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                애견만
              </button>
              <button
                className={cn(
                  'block w-full px-4 py-3 text-left text-sm text-slate-800 transition hover:bg-slate-100',
                  'dark:text-slate-100 dark:hover:bg-slate-800'
                )}
                role="menuitem"
              >
                시트지우기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
