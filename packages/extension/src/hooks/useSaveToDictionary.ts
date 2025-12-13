import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ZodError } from 'zod';
import { assistantApi } from '../services/api';
import { fromUnknown } from '../services/errorUtils';
import {
  createDictionaryEntryWithExampleBodySchema,
  createDictionaryEntryWithExampleResponseSchema,
  type CreateDictionaryEntryWithExampleBodyType,
  type CreateEntryWithExampleResponseType,
} from '@lab/types/assistant/dictionary-entries';

export function useSaveToDictionary() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CreateEntryWithExampleResponseType,
    AxiosError | ZodError,
    { endpoint: string; body: unknown }
  >({
    mutationFn: async ({ endpoint, body }) => {
      const res = await assistantApi.post(endpoint, body);
      return createDictionaryEntryWithExampleResponseSchema.parse(res.data);
    },
    onSuccess: async (res) => {
      toast.success(`"${res.text}" has been saved.`);

      await queryClient.invalidateQueries({
        queryKey: ['wordHistory'],
      });
    },
  });

  useEffect(() => {
    if (mutation.error) {
      fromUnknown(mutation.error, { notify: true });
    }
  }, [mutation.error]);

  const saveWordWithExample = (
    args: CreateDictionaryEntryWithExampleBodyType
  ): void => {
    try {
      mutation.mutate({
        endpoint: '/dictionary/with-example',
        body: createDictionaryEntryWithExampleBodySchema.parse(args),
      });
    } catch (error) {
      fromUnknown(error, {
        clientMessage: 'Failed to save the word with example.',
        notify: true,
      });
    }
  };

  return {
    saveWordWithExample,
    isSaving: mutation.isPending,
  };
}
