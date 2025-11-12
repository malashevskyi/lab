import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import type { FlashcardType } from '@lab/types/assistant/flashcards';
import { SINGLE_FLASHCARD_QUERY_KEY } from './useGetFlashcardsByUrl';

interface UpdateFlashcardDto {
  question: string;
  answer: string;
}

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    FlashcardType,
    ApiError,
    { id: string; data: UpdateFlashcardDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await assistantApi.put<FlashcardType>(
        `/flashcards/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedFlashcard) => {
      toast.success('Flashcard updated successfully!');

      queryClient.setQueryData(
        [SINGLE_FLASHCARD_QUERY_KEY, updatedFlashcard.id],
        updatedFlashcard
      );
    },
    onError: (error) => {
      ApiError.fromUnknown(error, {
        clientMessage: 'Failed to update the flashcard.',
      }).notify();
    },
  });

  const updateFlashcard = (id: string, question: string, answer: string) => {
    mutation.mutate({
      id,
      data: { question, answer },
    });
  };

  return {
    updateFlashcard,
    isUpdating: mutation.isPending,
  };
};
