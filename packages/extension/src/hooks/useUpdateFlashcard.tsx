import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assistantApi } from '../services/api';
import { fromUnknown } from '../services/errorUtils';
import type { FlashcardType } from '@lab/types/assistant/flashcards';
import { SINGLE_FLASHCARD_QUERY_KEY } from './useGetFlashcardsByUrl';
import { STACKS_QUERY_KEY } from './useGetStacks';

interface UpdateFlashcardDto {
  question?: string;
  answer?: string;
  context?: string;
}

interface MutationContext {
  previousFlashcard?: FlashcardType;
}

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    FlashcardType,
    unknown,
    { id: string; data: UpdateFlashcardDto },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const response = await assistantApi.put<FlashcardType>(
        `/flashcards/${id}`,
        data
      );
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [SINGLE_FLASHCARD_QUERY_KEY, id],
      });

      // Snapshot previous value
      const previousFlashcard = queryClient.getQueryData<FlashcardType>([
        SINGLE_FLASHCARD_QUERY_KEY,
        id,
      ]);

      // Optimistically update cache
      if (previousFlashcard) {
        queryClient.setQueryData<FlashcardType>(
          [SINGLE_FLASHCARD_QUERY_KEY, id],
          { ...previousFlashcard, ...data }
        );
      }

      return { previousFlashcard };
    },
    onSuccess: (updatedFlashcard) => {
      toast.success('Flashcard updated successfully!');

      // Update single flashcard cache with server response
      queryClient.setQueryData(
        [SINGLE_FLASHCARD_QUERY_KEY, updatedFlashcard.id],
        updatedFlashcard
      );

      // Invalidate to ensure fresh data
      void queryClient.invalidateQueries({
        queryKey: [SINGLE_FLASHCARD_QUERY_KEY, updatedFlashcard.id],
        refetchType: 'all',
      });

      void queryClient.invalidateQueries({
        queryKey: ['flashcard', updatedFlashcard.id],
        refetchType: 'all',
      });

      // If context was updated, invalidate stacks
      if (updatedFlashcard.context) {
        void queryClient.invalidateQueries({
          queryKey: [STACKS_QUERY_KEY],
          refetchType: 'all',
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousFlashcard) {
        queryClient.setQueryData(
          [SINGLE_FLASHCARD_QUERY_KEY, variables.id],
          context.previousFlashcard
        );
      }

      fromUnknown(error, {
        clientMessage: 'Failed to update the flashcard.',
        notify: true,
      });
    },
  });

  const updateFlashcard = (id: string, data: UpdateFlashcardDto) => {
    mutation.mutate({ id, data });
  };

  return {
    updateFlashcard,
    isUpdating: mutation.isPending,
  };
};
