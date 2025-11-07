import { useQuery } from '@tanstack/react-query';
import { getAllKeywords, getKeywordsByCompany, getVisibilityStats } from '../api';

export const keywordQueryKeys = {
  all: ['keywords'] as const,
  lists: () => [...keywordQueryKeys.all, 'list'] as const,
  list: (filters?: string) => [...keywordQueryKeys.lists(), { filters }] as const,
  company: (company: string) => [...keywordQueryKeys.all, 'company', company] as const,
  stats: () => [...keywordQueryKeys.all, 'stats'] as const,
};

export const useKeywords = () => {
  return useQuery({
    queryKey: keywordQueryKeys.lists(),
    queryFn: getAllKeywords,
  });
};

export const useKeywordsByCompany = (company: string) => {
  return useQuery({
    queryKey: keywordQueryKeys.company(company),
    queryFn: () => getKeywordsByCompany(company),
    enabled: !!company,
  });
};

export const useVisibilityStats = () => {
  return useQuery({
    queryKey: keywordQueryKeys.stats(),
    queryFn: getVisibilityStats,
  });
};
