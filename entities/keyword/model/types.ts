// 공통 베이스 키워드 타입
export interface BaseKeyword {
  keyword: string;
  company: string;
  visibility: boolean;
  url: string;
  lastChecked?: Date | string;
}

// 패키지 키워드 데이터 (Keyword 컬렉션)
export interface PackageKeywordData extends BaseKeyword {
  popularTopic: string;
  sheetType: 'package' | 'dogmaru' | 'dogmaru-exclude';
  // 크롤링 관련 필드
  matchedHtml?: string;
  matchedTitle?: string;
  restaurantName?: string;
  matchedPosition?: number;
}

// 루트건바 키워드 데이터 (RootKeyword 컬렉션)
export interface RootKeywordData extends BaseKeyword {
  // RootKeyword는 별도 컬렉션이므로 sheetType 없음
}
