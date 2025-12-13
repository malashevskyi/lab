import { useQuery } from '@tanstack/react-query';
import { assistantApi } from '../services/api';
import type { ZodError } from 'zod';
import type { AxiosError } from 'axios';
import { fromUnknown } from '../services/errorUtils';
import { useEffect } from 'react';
import {
  generateAudioResponseSchema,
  type GenerateAudioResponse,
} from '@lab/types/assistant/tts';

export function useAudioGeneration(text: string | undefined): {
  audioUrl: string | undefined;
  isLoadingAudio: boolean;
} {
  const query = useQuery<GenerateAudioResponse, AxiosError | ZodError>({
    queryKey: ['audio', text],
    queryFn: async () => {
      const res = await assistantApi.post<GenerateAudioResponse>(
        '/tts/generate-audio',
        {
          text,
        }
      );
      return generateAudioResponseSchema.parse(res.data);
    },
    enabled: !!text,
    retry: 1,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.error) {
      fromUnknown(query.error, {
        clientMessage: 'Failed to generate audio.',
        notify: true,
      });
    }
  }, [query.error]);

  return {
    audioUrl: query.data?.audioUrl,
    isLoadingAudio: query.isLoading,
  };
}
