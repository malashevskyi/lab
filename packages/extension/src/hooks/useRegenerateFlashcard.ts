import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createFlashcardBodySchema,
  type CreateFlashcardBodyType,
} from '@lab/types/deep-read/flashcards/index.js';
import type { ZodError } from 'zod';
import { useEffect } from 'react';
import { useAppStore } from '../store';

export const useRegenerateFlashcard = () => {
  const queryClient = useQueryClient();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const lastFlashcard = useAppStore((state) => state.lastFlashcard);
  const saveLastFlashcardChunks = useAppStore(
    (state) => state.saveLastFlashcardChunks
  );

  const mutation = useMutation<
    { id: string },
    ApiError | ZodError,
    CreateFlashcardBodyType
  >({
    mutationFn: async (flashcardData) => {
      const validatedData = createFlashcardBodySchema.parse(flashcardData);
      const response = await deepReadAPI.post('/flashcards', validatedData);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the stored ID with the new one
      saveLastFlashcardChunks(
        lastFlashcard.chunks,
        lastFlashcard.title,
        data.id
      );

      // Invalidate and refetch the last flashcard query to ensure updated data
      void queryClient.invalidateQueries({ queryKey: ['lastFlashcard'] });

      toast.success(`Flashcard regenerated successfully!`);
      // Switch to last-flashcard tab to show the updated card
      setActiveTab('last-flashcard');
    },
  });

  const regenerationError = mutation.error
    ? ApiError.fromUnknown(mutation.error, {
        clientMessage: 'Failed to regenerate the flashcard.',
      })
    : undefined;

  useEffect(() => {
    if (regenerationError) {
      regenerationError.notify();
    }
  }, [regenerationError]);

  const regenerateFlashcard = () => {
    if (!lastFlashcard.id || !lastFlashcard.chunks.length) {
      toast.error('No flashcard data available for regeneration');
      return;
    }

    const data: CreateFlashcardBodyType = {
      title: lastFlashcard.title,
      chunks: lastFlashcard.chunks.map((chunk) => chunk.text),
      sourceUrl: window.location.href,
      id: lastFlashcard.id, // Include the ID for regeneration
    };

    try {
      mutation.mutate(createFlashcardBodySchema.parse(data));
    } catch (error) {
      ApiError.fromUnknown(error, {
        clientMessage: 'Invalid data provided for flashcard regeneration.',
      }).notify();
    }
  };

  return {
    regenerateFlashcard,
    isRegenerating: mutation.isPending,
    canRegenerate: lastFlashcard.id !== null && lastFlashcard.chunks.length > 0,
  };
};
