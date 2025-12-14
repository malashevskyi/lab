import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";
import { toast } from "sonner";
import {
  generateAudioResponseSchema,
  type GenerateAudioResponse,
} from "@lab/types/assistant/tts";
import type { FlashcardType } from "@lab/types/assistant/flashcards";
import { SINGLE_FLASHCARD_QUERY_KEY } from "./useGetFlashcardsByUrl";

export function useGenerateFlashcardAudio(flashcardId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<GenerateAudioResponse, unknown, string>({
    mutationFn: async (id: string) => {
      const response = await assistantApi.post<GenerateAudioResponse>(
        `/flashcards/${id}/generate-question-audio`
      );
      return generateAudioResponseSchema.parse(response.data);
    },
    onSuccess: (data) => {
      toast.success("Audio generated successfully!");

      const updatedFlashcard = queryClient.getQueryData<FlashcardType>([
        SINGLE_FLASHCARD_QUERY_KEY,
        flashcardId,
      ]);
      if (!updatedFlashcard) return;

      updatedFlashcard.questionAudioUrl = data.audioUrl;

      queryClient.setQueryData(
        [SINGLE_FLASHCARD_QUERY_KEY, flashcardId],
        updatedFlashcard
      );
    },
    onError: (error) => {
      fromUnknown(error, {
        clientMessage: "Failed to generate audio for flashcard question.",
        notify: true,
      });
    },
  });

  const generateAudio = () => {
    mutation.mutate(flashcardId);
  };

  return {
    generateAudio,
    audioUrl: mutation.data?.audioUrl,
    isGenerating: mutation.isPending,
  };
}
