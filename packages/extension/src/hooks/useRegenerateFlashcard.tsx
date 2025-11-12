import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createFlashcardBodySchema,
  type CreateFlashcardBodyType,
} from '@lab/types/assistant/flashcards/index.js';
import type { ZodError } from 'zod';
import { useEffect } from 'react';
import { useAppStore } from '../store';
import { normalizeUrl } from '../utils/normalizeUrl';
import { GET_LAST_FLASHCARD_QUERY_KEY } from './useGetLastFlashcard';
import { LoadingButton } from '../components/ui/LoadingButton';

export const useRegenerateFlashcard = () => {
  const queryClient = useQueryClient();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const lastFlashcard = useAppStore((state) => state.lastFlashcard);
  const activeTab = useAppStore((state) => state.popup.activeTab);
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
      const response = await assistantApi.post('/flashcards', validatedData);
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
      void queryClient.invalidateQueries({
        queryKey: [GET_LAST_FLASHCARD_QUERY_KEY],
      });

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
      sourceUrl: normalizeUrl(window.location.href),
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

  const regenerateFlashcardButton = () => {
    const canRegenerate =
      lastFlashcard.id !== null && lastFlashcard.chunks.length > 0;
    if (!canRegenerate || activeTab !== 'last-flashcard') return null;

    return (
      <LoadingButton
        onClick={regenerateFlashcard}
        disabled={mutation.isPending}
        isLoading={mutation.isPending}
        loadingText="Regenerating..."
        idleText="Regenerate"
        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-solid border-blue-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    );
  };

  return {
    regenerateFlashcardButton: regenerateFlashcardButton(),
  };
};
