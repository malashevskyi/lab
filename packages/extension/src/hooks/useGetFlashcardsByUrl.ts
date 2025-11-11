import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ZodError } from 'zod';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  getLastFlashcardResponseSchema,
  type GetLastFlashcardResponseType,
} from '@lab/types/assistant/flashcards';
import { useEffect } from 'react';
import { normalizeUrl } from '../utils/normalizeUrl';

/**
 * @function useGetFlashcardsByUrl
 * @description A custom hook for fetching flashcards by source URL.
 * @param {string} sourceUrl - The URL to filter flashcards by
 * @returns An object containing query state and flashcards data.
 */
export const useGetFlashcardsByUrl = (sourceUrl: string) => {
  const query = useQuery<GetLastFlashcardResponseType[], AxiosError | ZodError>(
    {
      queryKey: ['flashcardsByUrl', sourceUrl],
      queryFn: async () => {
        const response = await assistantApi.get(
          `/flashcards/by-url/${encodeURIComponent(normalizeUrl(sourceUrl))}`
        );
        if (!response.data) return [];
        return getLastFlashcardResponseSchema.array().parse(response.data);
      },
      enabled: !!sourceUrl,
      retry: false,
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (query.error) {
      ApiError.fromUnknown(query.error, {
        clientMessage: 'Failed to fetch flashcards for this URL.',
      }).notify();
    }
  }, [query.error]);

  return {
    flashcardsData: query.data,
    isLoading: query.isFetching,
    refetch: query.refetch,
  };
};
