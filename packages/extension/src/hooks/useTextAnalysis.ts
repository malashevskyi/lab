import { useQuery } from '@tanstack/react-query';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import type { AxiosError } from 'axios';
import type { ZodError } from 'zod';
import { useAppStore } from '../store';
import {
  analysisResponseSchema,
  type AnalysisResponse,
} from '@lab/types/deep-read/ai';

export function useTextAnalysis(): {
  analysisData: AnalysisResponse | null;
  isLoadingText: boolean;
} {
  const text = useAppStore((state) => state.sidebar.selectedText);
  const context = useAppStore((state) => state.sidebar.context);
  const setNormalizedText = useAppStore((state) => state.setNormalizedText);

  const query = useQuery<AnalysisResponse, AxiosError | ZodError>({
    queryKey: ['analysis', text, context],
    queryFn: async () => {
      setNormalizedText('');
      const res = await deepReadAPI.post<AnalysisResponse>('/ai/analyze', {
        text,
        context,
      });

      setNormalizedText(res.data.word.text);
      return analysisResponseSchema.parse(res.data);
    },
    enabled: !!text && !!context,
    retry: false,
    staleTime: Infinity,
  });

  if (query.error) {
    ApiError.fromUnknown(query.error, {
      clientMessage: 'Failed to analyze the selected text.',
    }).notify();
  }

  return {
    analysisData: query.data ?? null,
    isLoadingText: query.isLoading,
  };
}
