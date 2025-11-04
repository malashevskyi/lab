import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ZodError } from 'zod';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createDictionaryEntryWithExampleBodySchema,
  createDictionaryEntryWithExampleResponseSchema,
  type CreateDictionaryEntryWithExampleBodyType,
  type CreateEntryWithExampleResponseType,
} from '@lab/types/deep-read/dictionary-entries';

export function useSaveToDictionary() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CreateEntryWithExampleResponseType,
    AxiosError | ZodError,
    { endpoint: string; body: unknown }
  >({
    mutationFn: async ({ endpoint, body }) => {
      const res = await deepReadAPI.post(endpoint, body);
      return createDictionaryEntryWithExampleResponseSchema.parse(res.data);
    },
    onSuccess: async (res) => {
      toast.success(`"${res.text}" has been saved.`);

      await queryClient.invalidateQueries({
        queryKey: ['wordHistory'],
      });
    },
  });

  const saveError = mutation.error
    ? ApiError.fromUnknown(mutation.error)
    : null;

  useEffect(() => {
    if (saveError) toast.error(`Failed to save: ${saveError.message}`);
  }, [saveError]);

  const saveWordWithExample = (
    args: CreateDictionaryEntryWithExampleBodyType
  ): void => {
    try {
      mutation.mutate({
        endpoint: '/dictionary/with-example',
        body: createDictionaryEntryWithExampleBodySchema.parse(args),
      });
    } catch (error) {
      ApiError.fromUnknown(error, {
        clientMessage: 'Failed to save the word with example.',
      }).notify();
    }
  };

  return {
    saveWordWithExample,
    isSaving: mutation.isPending,
  };
}
