// Google Sheets 관련 상수

// 원본 시트 설정
const PRODUCTION_CONFIG = {
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

// 테스트용 사본 시트 설정
const TEST_CONFIG = {
  SHEET_ID: '1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0',
  SHEET_NAMES: {
    PACKAGE: '패키지 노출체크 프로그램',
    DOGMARU_EXCLUDE: '일반건 노출체크 프로그램',
    DOGMARU: '도그마루 노출체크 프로그램',
  },
  LABELS: {
    PACKAGE: '패키지 노출체크 프로그램',
    DOGMARU_EXCLUDE: '일반건 노출체크 프로그램',
    DOGMARU: '도그마루 노출체크 프로그램',
  },
} as const;

// 환경변수로 테스트 모드 제어 (기본값: false = 원본)
const USE_TEST_SHEET =
  process.env.NEXT_PUBLIC_USE_TEST_SHEET === 'true' || true; // TODO: true를 false로 변경하면 원본 사용

const currentConfig = TEST_CONFIG;

export const SHEET_ID = currentConfig.SHEET_ID;
export const SHEET_NAMES = currentConfig.SHEET_NAMES;
export const SHEET_LABELS = currentConfig.LABELS;

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
      return SHEET_NAMES.PACKAGE;
    case 'dogmaru':
      return SHEET_NAMES.DOGMARU;
    case 'dogmaru-exclude':
      return SHEET_NAMES.DOGMARU_EXCLUDE;
    default:
      return SHEET_NAMES.PACKAGE;
  }
};

export const getTabLabel = (type: MainTab): string => {
  switch (type) {
    case 'package':
      return SHEET_LABELS.PACKAGE;
    case 'dogmaru':
      return SHEET_LABELS.DOGMARU;
    case 'dogmaru-exclude':
      return SHEET_LABELS.DOGMARU_EXCLUDE;
  }
};
