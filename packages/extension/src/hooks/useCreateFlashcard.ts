import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createFlashcardBodySchema,
  createFlashcardResponseSchema,
  type CreateFlashcardBodyType,
  type CreateFlashcardResponseType,
} from '@lab/types/deep-read/flashcards';
import type { ZodError } from 'zod';
import { useEffect } from 'react';

export const useCreateFlashcard = () => {
  const mutation = useMutation<
    CreateFlashcardResponseType,
    ApiError | ZodError,
    CreateFlashcardBodyType
  >({
    mutationFn: async (flashcardData) => {
      const validatedData = createFlashcardBodySchema.parse(flashcardData);
      const response = await deepReadAPI.post('/flashcards', validatedData);
      return createFlashcardResponseSchema.parse(response.data);
    },
    onSuccess: (data) => {
      toast.success(
        `Flashcard "${data.question.substring(0, 20)}..." created successfully!`
      );
    },
  });

  const creationError = mutation.error
    ? ApiError.fromUnknown(mutation.error, {
        clientMessage: 'Failed to create the flashcard.',
      })
    : null;

  useEffect(() => {
    if (creationError) {
      creationError.notify();
    }
  }, [creationError]);

  const createFlashcard = (data: CreateFlashcardBodyType) => {
    try {
      const validatedData = createFlashcardBodySchema.parse(data);
      mutation.mutate(validatedData);
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
