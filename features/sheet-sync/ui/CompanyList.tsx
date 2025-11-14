'use client';

import { useRouter } from 'next/navigation';
import { useCompanyList } from '@/entities';

export const CompanyList = () => {
  const router = useRouter();
  const { companyList } = useCompanyList();

  if (companyList.length === 0) return null;

  return (
    <div className="mb-6 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        회사 목록
      </h2>
      <div className="flex flex-wrap gap-2">
        {companyList.map((company) => (
          <button
            key={company.sheetId}
            onClick={() => router.push(`/sheets/${company.sheetId}`)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {company.name}
          </button>
        ))}
      </div>
    </div>
  );
};
