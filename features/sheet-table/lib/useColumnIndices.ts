import { useMemo } from 'react';

const VISIBLE_DATE_RANGE_DAYS = 7;

const parseKoreanDate = (dateStr: string): Date | null => {
  const match = dateStr?.match(/(\d+)월(\d+)일/);
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const currentYear = new Date().getFullYear();

  return new Date(currentYear, month - 1, day);
};

export const useColumnIndices = (sheetData: string[][] | undefined) => {
  return useMemo(() => {
    const data = sheetData || [];
    const headers = data[0] || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - VISIBLE_DATE_RANGE_DAYS);
    const daysLater = new Date(today);
    daysLater.setDate(today.getDate() + VISIBLE_DATE_RANGE_DAYS);

    const visibleColumnIndices = headers
      .map((header, index) => {
        const parsedDate = parseKoreanDate(header);
        if (!parsedDate) return { index, visible: true };

        const isInRange = parsedDate >= daysAgo && parsedDate <= daysLater;
        return { index, visible: isInRange };
      })
      .filter((col) => col.visible)
      .map((col) => col.index);

    const originalUrlColumnIndex = headers.findIndex(
      (header) => header?.toLowerCase() === 'url'
    );

    const originalNameColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase() === '회사명' || header?.toLowerCase() === 'name'
    );

    const originalVisibilityColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase().includes('노출여부') ||
        header?.toLowerCase().includes('노출')
    );

    const originalKeywordColumnIndex = headers.findIndex(
      (header) =>
        header?.toLowerCase() === '키워드' || header?.toLowerCase() === 'keyword'
    );

    return {
      visibleColumnIndices,
      allHeaders: headers,
      originalUrlColumnIndex,
      originalNameColumnIndex,
      originalVisibilityColumnIndex,
      originalKeywordColumnIndex,
    };
  }, [sheetData]);
};
