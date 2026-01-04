export type SheetRow = string[];
export type SheetUpdate = { range: string; values: string[][] };

export const toKey = (kw: any) => {
  const { company = '', keyword = '', popularTopic = '', url = '' } = kw;
  return `${company}||${keyword}||${popularTopic}||${url}`;
};

export const getSafeTime = (kw: any) => {
  return new Date(
    kw.updatedAt || kw.createdAt || kw.lastChecked || 0
  ).getTime();
};

export const buildLatestKeywordMap = (dbKeywords: any[]) => {
  const latestMap = new Map<string, any>();

  for (const kw of dbKeywords) {
    const key = toKey(kw);
    const prev = latestMap.get(key);
    if (!prev) {
      latestMap.set(key, kw);
      continue;
    }

    const prevTime = getSafeTime(prev);
    const curTime = getSafeTime(kw);

    if (
      curTime > prevTime ||
      (curTime === prevTime && String(kw._id) > String(prev._id))
    ) {
      latestMap.set(key, kw);
    }
  }

  return latestMap;
};

export const getColumnLetter = (colIndex: number): string => {
  let letter = '';
  let temp = colIndex + 1;
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

export const normalize = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase() : '';

export const findColumnIndexes = (headers: SheetRow) => {
  const companyColumnIndex = headers.findIndex((header) => {
    const h = normalize(header);
    return h === '회사명' || h === 'name' || h === '업체';
  });

  const keywordColumnIndex = headers.findIndex((header) => {
    const h = normalize(header);
    return h === '키워드' || h === 'keyword';
  });

  const popularTopicColumnIndex = headers.findIndex((header) =>
    normalize(header).includes('인기주제')
  );

  const visibilityColumnIndex = headers.findIndex((header) => {
    const h = normalize(header);
    return h.includes('노출여부') || h.includes('노출');
  });

  const urlColumnIndex = headers.findIndex((h) => normalize(h) === 'url');

  return {
    companyColumnIndex,
    keywordColumnIndex,
    popularTopicColumnIndex,
    visibilityColumnIndex,
    urlColumnIndex,
  };
};

export const ensureRequiredColumns = (
  title: string,
  columns: {
    companyColumnIndex?: number;
    keywordColumnIndex: number;
    visibilityColumnIndex: number;
  }
) => {
  const { companyColumnIndex, keywordColumnIndex, visibilityColumnIndex } =
    columns;

  if (
    companyColumnIndex === undefined ||
    companyColumnIndex === -1 ||
    keywordColumnIndex === -1 ||
    visibilityColumnIndex === -1
  ) {
    return {
      title,
      matched: 0,
      updatedCells: 0,
      skipped: true as const,
      reason: '필요 컬럼 없음',
    };
  }

  return null;
};

export const IMPORT_SHEET_HEADERS = [
  '업체명',
  '키워드',
  '인기주제',
  '순위',
  '노출여부',
  '바이럴 체크',
  '인기글 순위',
  '이미지 매칭',
  '링크',
  '변경',
];

export const mapKeywordToRow = (kw: any): string[] => [
  kw.company || '',
  kw.keyword || '',
  kw.popularTopic || '',
  kw.rank ? String(kw.rank) : '',
  kw.visibility ? 'o' : '',
  '',
  kw.rankWithCafe ? String(kw.rankWithCafe) : '',
  kw.isUpdateRequired === true ? 'o' : '',
  kw.url || '',
  kw.isNewLogic ? 'o' : '',
];
