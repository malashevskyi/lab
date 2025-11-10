import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { ApiError } from '../services/ApiError';
import type { FlashcardType } from '@lab/types/assistant/flashcards';
import { useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { useAppStore } from '../store';

interface UpdateFlashcardDto {
  question: string;
  answer: string;
}

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();
  const hasChanges = useAppStore((state) => state.lastFlashcard.hasChanges);
  const editedQuestion = useAppStore(
    (state) => state.lastFlashcard.editedQuestion
  );
  const editedAnswer = useAppStore((state) => state.lastFlashcard.editedAnswer);
  const flashcardId = useAppStore((state) => state.lastFlashcard.id);
  const onLastFlashcardChange = useAppStore(
    (state) => state.onLastFlashcardChange
  );

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

  const updateFlashcardButton = () => {
    if (!hasChanges || !flashcardId) return null;

    return (
      <button
        onClick={() => {
          onLastFlashcardChange({ hasChanges: false });
          updateFlashcard(flashcardId, {
            question: editedQuestion,
            answer: editedAnswer,
          });
        }}
        disabled={mutation.isPending}
        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 border border-solid border-green-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Update flashcard changes"
      >
        <FaSave
          className={`w-3 h-3 ${mutation.isPending ? 'animate-pulse' : ''}`}
        />
        <span className="hidden sm:inline">
          {mutation.isPending ? 'Updating...' : 'Update'}
        </span>
      </button>
    );
  };

  return {
    updateFlashcardButton: updateFlashcardButton(),
  };
};
