import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deepReadAPI } from '../services/api';
import { ApiError } from '../services/ApiError';
import {
  createFlashcardBodySchema,
  type CreateFlashcardBodyType,
} from '@lab/types/deep-read/flashcards/index.js';
import type { ZodError } from 'zod';
import { useEffect } from 'react';

export const useCreateFlashcard = () => {
  const mutation = useMutation<
    undefined,
    ApiError | ZodError,
    CreateFlashcardBodyType
  >({
    mutationFn: async (flashcardData) => {
      const validatedData = createFlashcardBodySchema.parse(flashcardData);
      const response = await deepReadAPI.post('/flashcards', validatedData);
      return response.data;
    },
    onSuccess: () => {
      toast.success(`Flashcard created successfully!`);
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
