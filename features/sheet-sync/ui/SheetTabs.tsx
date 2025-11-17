'use client';

import { useAtom } from 'jotai';
import { activeTabAtom } from '@/shared/model/sheet.store';
import { getTabLabel, type MainTab } from '@/shared/constants/sheet';

const tabs: MainTab[] = ['package', 'dogmaru-exclude', 'dogmaru'];

export const SheetTabs = () => {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
            activeTab === tab
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {getTabLabel(tab)}
        </button>
      ))}
    </div>
  );
};
