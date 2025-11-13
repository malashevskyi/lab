import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  SINGLE_FLASHCARD_QUERY_KEY,
  FLASHCARDS_BY_URL_QUERY_KEY,
} from './useGetFlashcardsByUrl';
import { normalizeUrl } from '../utils/normalizeUrl';
import type { FlashcardType } from '@lab/types/assistant/flashcards/interfaces/flashcard.interface';
import { useAppStore } from '../store';
import { GET_LAST_FLASHCARD_QUERY_KEY } from './useGetLastFlashcard';

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();
  const lastFlashcard = useAppStore((state) => state.lastFlashcard);

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: async (flashcardId: string) => {
      await assistantApi.delete(`/flashcards/${flashcardId}`);
    },
    onSuccess: (_, flashcardId) => {
      toast.success('Flashcard deleted successfully!');

      queryClient.removeQueries({
        queryKey: [SINGLE_FLASHCARD_QUERY_KEY, flashcardId],
      });

      const normalizedUrl = normalizeUrl(window.location.href);

      queryClient.setQueryData<FlashcardType['id'][]>(
        [FLASHCARDS_BY_URL_QUERY_KEY, normalizedUrl, 'ids'],
        (oldIds) => oldIds?.filter((id) => id !== flashcardId) ?? []
      );

      if (lastFlashcard?.id === flashcardId) {
        void queryClient.invalidateQueries({
          queryKey: [GET_LAST_FLASHCARD_QUERY_KEY],
        });
      }
    },
    onError: (error) => {
      ApiError.fromUnknown(error, {
        clientMessage: 'Failed to delete the flashcard.',
      }).notify();
    },
  });

  return {
    deleteFlashcard: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};
