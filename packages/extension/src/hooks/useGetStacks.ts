import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { assistantApi } from '../services/api';
import { fromUnknown } from '../services/errorUtils';
import type { StackType } from '@lab/types/assistant/stack/index.js';

export const STACKS_QUERY_KEY = 'stacks';

export const useGetStacks = () => {
  const query = useQuery({
    queryKey: [STACKS_QUERY_KEY],
    queryFn: async () => {
      const response = await assistantApi.get<StackType[]>('/stacks');
      return response.data.map((stack) => stack.id);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.error) {
      fromUnknown(query.error, {
        clientMessage: 'Не вдалося завантажити список стеків.',
        notify: true,
      });
    }
  }, [query.error]);

  return {
    stacks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
