import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import type { FlashcardType } from '@lab/types/deep-read/flashcards';
import { useEffect } from 'react';

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
      const response = await deepReadAPI.put<FlashcardType>(
        `/flashcards/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Flashcard updated successfully!');
      void queryClient.invalidateQueries({ queryKey: ['lastFlashcard'] });
    },
  });

  useEffect(() => {
    if (mutation.error) {
      ApiError.fromUnknown(mutation.error, {
        clientMessage: 'Failed to update the flashcard.',
      }).notify();
    }
  }, [mutation.error]);

  const updateFlashcard = (id: string, data: UpdateFlashcardDto) => {
    try {
      mutation.mutate({ id, data });
      console.log('🚀 ~ mutation:', mutation);
    } catch (error) {
      ApiError.fromUnknown(error, {
        clientMessage: 'Invalid data provided for flashcard update.',
      }).notify();
    }
  };

  return {
    updateFlashcard,
    isUpdating: mutation.isPending,
  };
};
