'use client';

import { useAtom } from 'jotai';
import { SheetTable } from '@/features';
import {
  PageHeader,
  SheetTabs,
  SheetActions,
  CompanyList,
} from '@/features/sheet-sync';
import { activeTabAtom } from '@/shared/model/sheet.store';
import { SHEET_ID, getSheetNameByType } from '@/shared/config/sheet';

export default function Home() {
  const [activeTab] = useAtom(activeTabAtom);
  const currentSheetName = getSheetNameByType(activeTab);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PageHeader />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <SheetTabs />
          <SheetActions />
        </div>

        <CompanyList />

        <SheetTable
          sheetId={SHEET_ID}
          sheetName={currentSheetName}
          showNavigation={true}
        />
      </div>
    </div>
  );
}
1;
