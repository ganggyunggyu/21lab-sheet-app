import { useAtom, useAtomValue } from 'jotai';
import { sheetIdAtom, companyListAtom, type CompanySheet } from '../model/atoms';

export const useSheetId = () => {
  const [sheetId, setSheetId] = useAtom(sheetIdAtom);

  const changeSheet = (newSheetId: string) => {
    setSheetId(newSheetId);
  };

  return {
    sheetId,
    changeSheet,
  };
};

export const useSheetIdValue = () => {
  return useAtomValue(sheetIdAtom);
};

export const useCompanyList = () => {
  const [companyList, setCompanyList] = useAtom(companyListAtom);

  const addCompany = (company: CompanySheet) => {
    setCompanyList((prev) => {
      const exists = prev.some((c) => c.sheetId === company.sheetId);
      if (exists) return prev;
      return [...prev, company];
    });
  };

  const setCompanies = (companies: CompanySheet[]) => {
    setCompanyList(companies);
  };

  return {
    companyList,
    addCompany,
    setCompanies,
  };
};
