export const extractSheetId = (url: string): string => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl.includes('/') && !trimmedUrl.includes('http')) {
    return trimmedUrl;
  }

  const match = trimmedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return trimmedUrl;
};

export const toColumnLetter = (columnIndex: number): string => {
  let columnLetter = '';
  let tempCol = columnIndex + 1;

  while (tempCol > 0) {
    const remainder = (tempCol - 1) % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
    tempCol = Math.floor((tempCol - 1) / 26);
  }

  return columnLetter;
};
