import { atom } from 'jotai';

const DEFAULT_SHEET_ID = '1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0';

export const sheetIdAtom = atom<string>(DEFAULT_SHEET_ID);

export interface CompanySheet {
  name: string;
  sheetId: string;
}

export const companyListAtom = atom<CompanySheet[]>([]);
