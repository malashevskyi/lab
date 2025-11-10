import { useQuery } from '@tanstack/react-query';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import type { AxiosError } from 'axios';
import type { ZodError } from 'zod';
import { useAppStore } from '../store';
import { useEffect } from 'react';
import {
  getDictionaryEntryWithExamplesByTextResponseSchema,
  type GetDictionaryEntryWithExamplesByTextResponseType,
} from '@lab/types/assistant/dictionary-entries';

export function useWordHistory(): {
  historyData: GetDictionaryEntryWithExamplesByTextResponseType | null;
  isLoadingHistory: boolean;
} {
  const normalizedText = useAppStore((state) => state.analysis.normalizedText);
  const selectedText = useAppStore((state) => state.analysis.selectedText);

  const query = useQuery<
    GetDictionaryEntryWithExamplesByTextResponseType | null,
    AxiosError | ZodError
  >({
    queryKey: ['wordHistory', normalizedText],
    queryFn: async () => {
      const res = await assistantApi.get(`/dictionary/${normalizedText}`);
      if (res.data) {
        return getDictionaryEntryWithExamplesByTextResponseSchema.parse(
          res.data
        );
      }
      return null;
    },
    enabled: !!normalizedText && !!selectedText,
    retry: 1,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.error) {
      ApiError.fromUnknown(query.error, {
        clientMessage: 'Failed to fetch word history.',
      }).notify();
    }
  }, [query.error]);

  return {
    historyData: query.data ?? null,
    isLoadingHistory: query.isLoading,
  };
}
