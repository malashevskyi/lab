import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ZodError } from "zod";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";
import {
  getLastFlashcardResponseSchema,
  type FlashcardType,
} from "@lab/types/assistant/flashcards";
import { useEffect } from "react";
import { normalizeUrl } from "../utils/normalizeUrl";
import { useGetFlashcardGroupUrls } from "./useGetFlashcardGroupUrls";
import { useAppStore } from "../store";

export const FLASHCARDS_BY_URL_QUERY_KEY = "flashcardsByUrl";
export const SINGLE_FLASHCARD_QUERY_KEY = "flashcard";

/**
 * @function useGetFlashcardsByUrl
 * @description Fetch + NORMALIZE flashcards by URL.
 */
export const useGetFlashcardsByUrl = () => {
  const activeTab = useAppStore((state) => state.popup.activeTab);
  const queryClient = useQueryClient();

  const { groupUrls } = useGetFlashcardGroupUrls();

  const normalizedUrl = normalizeUrl(window.location.href, groupUrls);

  const { data: flashcardIds } = useQuery<FlashcardType["id"][]>({
    queryKey: [FLASHCARDS_BY_URL_QUERY_KEY, normalizedUrl, "ids"],
    enabled: false,
  });

  const query = useQuery<FlashcardType[], AxiosError | ZodError>({
    queryKey: [FLASHCARDS_BY_URL_QUERY_KEY, normalizedUrl],
    queryFn: async () => {
      const response = await assistantApi.get(
        `/flashcards/by-url/${encodeURIComponent(normalizedUrl)}`
      );

      const data = response.data || [];
      return getLastFlashcardResponseSchema.array().parse(data);
    },

    enabled: false,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.data) return;

    const cards = query.data;

    queryClient.setQueryData(
      [FLASHCARDS_BY_URL_QUERY_KEY, normalizedUrl, "ids"],
      cards.map((c) => c.id)
    );
    cards.forEach((card) => {
      queryClient.setQueryData([SINGLE_FLASHCARD_QUERY_KEY, card.id], card);
    });
  }, [query.data, queryClient, normalizedUrl]);

  useEffect(() => {
    if (query.error) {
      fromUnknown(query.error, {
        clientMessage: "Failed to fetch flashcards for this URL.",
        notify: true,
      });
    }
  }, [query.error]);

  useEffect(() => {
    if (activeTab === "flashcards") void query.refetch();
  }, [activeTab]);

  return {
    flashcardIds,
    isLoading: query.isFetching,
    refetch: query.refetch,
  };
};
