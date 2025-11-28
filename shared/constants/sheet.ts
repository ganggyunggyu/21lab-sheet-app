export const PRODUCTION_CONFIG = {
  SHEET_ID: '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0',
  SHEET_NAMES: {
    PACKAGE: '패키지',
    DOGMARU: '도그마루',
    DOGMARU_EXCLUDE: '도그마루 제외',
  },
  LABELS: {
    PACKAGE: '패키지',
    DOGMARU: '도그마루',
    DOGMARU_EXCLUDE: '도그마루 제외',
  },
} as const;

export const TEST_CONFIG = {
  SHEET_ID: '1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0',
  SHEET_NAMES: {
    PACKAGE: '패키지',
    DOGMARU_EXCLUDE: '일반건',
    DOGMARU: '도그마루',
  },
  LABELS: {
    PACKAGE: '패키지',
    DOGMARU_EXCLUDE: '일반건',
    DOGMARU: '도그마루',
  },
} as const;

export const DEFAULT_SHEET_RANGE = 'A:ZZ';

export type MainTab = 'package' | 'dogmaru' | 'dogmaru-exclude';

export interface KeywordData {
  company: string;
  keyword: string;
  visibility: boolean;
  popularTopic: string;
  url: string;
  sheetType: MainTab;
}

export const getSheetNameByType = (type: MainTab): string => {
  switch (type) {
    case 'package':
      return PRODUCTION_CONFIG.SHEET_NAMES.PACKAGE;
    case 'dogmaru':
      return PRODUCTION_CONFIG.SHEET_NAMES.DOGMARU;
    case 'dogmaru-exclude':
      return PRODUCTION_CONFIG.SHEET_NAMES.DOGMARU_EXCLUDE;
    default:
      return PRODUCTION_CONFIG.SHEET_NAMES.PACKAGE;
  }
};

export const getTabLabel = (type: MainTab): string => {
  switch (type) {
    case 'package':
      return PRODUCTION_CONFIG.LABELS.PACKAGE;
    case 'dogmaru':
      return PRODUCTION_CONFIG.LABELS.DOGMARU;
    case 'dogmaru-exclude':
      return PRODUCTION_CONFIG.LABELS.DOGMARU_EXCLUDE;
  }
};
