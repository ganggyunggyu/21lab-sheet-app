import { atom } from 'jotai';
import type { MainTab } from '../config/sheet';

// 현재 활성 탭
export const activeTabAtom = atom<MainTab>('package');

// 동기화 진행 중 여부
export const isSyncingAtom = atom(false);

// 드롭다운 열림 상태
export const isExportOpenAtom = atom(false);
export const isRootOpenAtom = atom(false);
export const isImportOpenAtom = atom(false);
