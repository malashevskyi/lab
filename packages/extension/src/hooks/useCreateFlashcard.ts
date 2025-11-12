import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createFlashcardBodySchema,
  createFlashcardResponseSchema,
  type CreateFlashcardBodyType,
} from '@lab/types/assistant/flashcards/index.js';
import type { ZodError } from 'zod';
import { useEffect } from 'react';
import { useAppStore } from '../store';
import { GET_LAST_FLASHCARD_QUERY_KEY } from './useGetLastFlashcard';

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();
  const clearFlashcardChunks = useAppStore(
    (state) => state.clearFlashcardChunks
  );
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const saveLastFlashcardChunks = useAppStore(
    (state) => state.saveLastFlashcardChunks
  );
  const flashcardChunks = useAppStore((state) => state.flashcardCreator.chunks);
  const flashcardTitle = useAppStore((state) => state.flashcardCreator.title);

  const mutation = useMutation<
    { id: string },
    ApiError | ZodError,
    CreateFlashcardBodyType
  >({
    mutationFn: async (flashcardData) => {
      const validatedData = createFlashcardBodySchema.parse(flashcardData);
      const response = await assistantApi.post('/flashcards', validatedData);
      return createFlashcardResponseSchema.parse(response.data);
    },
    onSuccess: (data) => {
      // Save chunks, title and ID for potential regeneration
      // Only save if we're creating a new flashcard (not regenerating)
      if (!mutation.variables?.id) {
        saveLastFlashcardChunks(flashcardChunks, flashcardTitle, data.id);
      }

      // Invalidate and refetch the last flashcard query to ensure updated data
      void queryClient.invalidateQueries({
        queryKey: [GET_LAST_FLASHCARD_QUERY_KEY],
      });

      toast.success(`Flashcard created successfully!`);
      clearFlashcardChunks();
      // Switch to last-flashcard tab after successful creation to check the new card
      setActiveTab('last-flashcard');
    },
  });

  const creationError = mutation.error
    ? ApiError.fromUnknown(mutation.error, {
        clientMessage: 'Failed to create the flashcard.',
      })
    : undefined;

  useEffect(() => {
    if (creationError) {
      creationError.notify();
    }
  }, [creationError]);

  const createFlashcard = (data: CreateFlashcardBodyType) => {
    try {
      mutation.mutate(createFlashcardBodySchema.parse(data));
    } catch (error) {
      ApiError.fromUnknown(error, {
        clientMessage: 'Invalid data provided for flashcard creation.',
      }).notify();
    }
  };

  return {
    createFlashcard,
    isCreating: mutation.isPending,
  };
};
