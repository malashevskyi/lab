import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";
import {
  createChunksBodyTypeSchema,
  type CreateChunksBodyType,
} from "@lab/types/assistant/chunks/index.js";
import { useEffect } from "react";
import { useAppStore } from "../store";

export const useSaveChunks = () => {
  const clearFlashcardChunks = useAppStore(
    (state) => state.clearFlashcardChunks
  );
  const flashcardChunks = useAppStore((state) => state.flashcardCreator.chunks);

  const mutation = useMutation<void, unknown, CreateChunksBodyType>({
    mutationFn: async (chunksData) => {
      const validatedData = createChunksBodyTypeSchema.parse(chunksData);
      await assistantApi.post("/chunks", validatedData);
    },
    onSuccess: () => {
      toast.success(`Chunks saved successfully!`);
      clearFlashcardChunks();
    },
  });

  useEffect(() => {
    if (mutation.error) {
      fromUnknown(mutation.error, {
        clientMessage: "Failed to save the chunks.",
        notify: true,
      });
    }
  }, [mutation.error]);

  const saveChunks = () => {
    try {
      const chunksData: CreateChunksBodyType = {
        chunks: flashcardChunks.map((chunk) => ({
          text: chunk.text,
          lang: DEFAULT_LANGUAGE, // Default language
        })),
        adjust: true, // Enable AI processing, translation, and audio generation
      };
      mutation.mutate(createChunksBodyTypeSchema.parse(chunksData));
    } catch (error) {
      fromUnknown(error, {
        clientMessage: "Invalid data provided for saving chunks.",
        notify: true,
      });
    }
  };

  return {
    saveChunks,
    isSaving: mutation.isPending,
  };
};
