'use client';

import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/features';

export const PageHeader = () => {
  const router = useRouter();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-normal text-gray-900 dark:text-white">
          Google Sheets Manager
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/root-gunba')}
            className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            Root Gunba
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
