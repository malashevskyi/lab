import { useQuery } from '@tanstack/react-query';
import { deepReadAPI } from '../services/api';
import type { ZodError } from 'zod';
import type { AxiosError } from 'axios';
import { ApiError } from '../services/ApiError';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
  generateAudioResponseSchema,
  type GenerateAudioResponse,
} from '@lap/types/deep-read/tts';

export function useAudioGeneration(text: string | undefined): {
  audioUrl: string | undefined;
  isLoadingAudio: boolean;
} {
  const query = useQuery<GenerateAudioResponse, AxiosError | ZodError>({
    queryKey: ['audio', text],
    queryFn: async () => {
      const res = await deepReadAPI.post<GenerateAudioResponse>(
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

  const audioError = query.error ? ApiError.fromUnknown(query.error) : null;

  useEffect(() => {
    if (audioError)
      toast.error(`Failed to generate audio: ${audioError.message}`);
  }, [audioError]);

  return {
    audioUrl: query.data?.audioUrl,
    isLoadingAudio: query.isLoading,
  };
}
