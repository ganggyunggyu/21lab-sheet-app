'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/entities';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};
