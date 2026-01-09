import { useMutation } from "@tanstack/react-query";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";

export const useSaveChunk = () => {
  const mutation = useMutation({
    mutationFn: async (chunk: string) => {
      await assistantApi.post("/chunks", {
        chunks: [{ text: chunk }],
        adjust: true,
      });
    },
    onError: (err) => {
      fromUnknown(err, {
        clientMessage: "Failed to save chunk.",
        notify: true,
      });
    },
  });

  return {
    saveChunk: mutation.mutate,
    isSaving: mutation.isPending,
  };
};
