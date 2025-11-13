import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import { useEffect } from 'react';
import { SINGLE_FLASHCARD_QUERY_KEY } from './useGetFlashcardsByUrl';

export const TODAY_COUNT_QUERY_KEY = 'todayFlashcardsCount';

export const useGetTodayFlashcardsCount = () => {
  const queryClient = useQueryClient();

  const query = useQuery<number, ApiError>({
    queryKey: [TODAY_COUNT_QUERY_KEY],
    queryFn: async () => {
      const response = await assistantApi.get<{ count: number }>(
        '/flashcards/today/count'
      );
      return response.data.count;
    },
    staleTime: 1000 * 60 * 25,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 2,
  });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (!event?.query?.queryKey?.[0]) return;
      const [key] = event.query.queryKey;

      if (key === SINGLE_FLASHCARD_QUERY_KEY) {
        void query.refetch();
      }
    });
    return () => unsubscribe();
  }, [queryClient, query]);

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
  };
};
