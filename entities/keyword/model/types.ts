// 공통 베이스 키워드 타입
export interface BaseKeyword {
  keyword: string;
  company: string;
  visibility: boolean;
  url: string;
  lastChecked?: Date | string;
  rank: number;
  sheetType: 'package' | 'dogmaru' | 'dogmaru-exclude' | 'pet';
  popularTopic: string;
  matchedTitle?: string;
}

// 패키지 키워드 데이터 (Keyword 컬렉션)
export interface PackageKeywordData extends BaseKeyword {
  // 크롤링 관련 필드
  matchedHtml?: string;
  restaurantName?: string;
}

// 루트건바 키워드 데이터 (RootKeyword 컬렉션)
export interface RootKeywordData extends Omit<BaseKeyword, 'rank' | 'sheetType' | 'popularTopic'> {
  rank?: number;
  rankWithCafe?: number;
  sheetType?: 'package' | 'dogmaru' | 'dogmaru-exclude' | 'pet';
  popularTopic?: string;
  isUpdateRequired?: boolean;
  isNewLogic?: boolean;
}
