import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ZodError } from "zod";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";
import {
  getLastFlashcardResponseSchema,
  type GetLastFlashcardResponseType,
} from "@lab/types/assistant/flashcards";
import { useEffect } from "react";
import { SINGLE_FLASHCARD_QUERY_KEY } from "./useGetFlashcardsByUrl";

export const GET_LAST_FLASHCARD_QUERY_KEY = "lastFlashcard";

/**
 * @function useGetLastFlashcard
 * @description A custom hook for fetching the last created flashcard.
 * The query is disabled by default and can be triggered manually.
 * @returns An object containing query state and a `fetchLastCard` function.
 */
export const useGetLastFlashcard = () => {
  const queryClient = useQueryClient();

  const query = useQuery<GetLastFlashcardResponseType, AxiosError | ZodError>({
    queryKey: [GET_LAST_FLASHCARD_QUERY_KEY],
    queryFn: async () => {
      const response = await assistantApi.get("/flashcards/last");
      if (!response.data) return null;
      return getLastFlashcardResponseSchema.parse(response.data);
    },
    enabled: true, // Enable auto-fetching so it responds to invalidations
    retry: false,
    staleTime: 0, // Consider data immediately stale so it refetches on invalidation
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.data) return;

    const card = query.data;

    queryClient.setQueryData([SINGLE_FLASHCARD_QUERY_KEY, card.id], card);
  }, [query.data]);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "removed" &&
        event.query.queryKey[0] === SINGLE_FLASHCARD_QUERY_KEY
      ) {
        void query.refetch();
      }
    });
    return () => unsubscribe();
  }, [queryClient, query]);

  useEffect(() => {
    if (query.error) {
      fromUnknown(query.error, {
        clientMessage: "Failed to fetch the last flashcard.",
        context: "useGetLastFlashcard",
        notify: true,
      });
    }
  }, [query.error]);

  return {
    lastCardData: query.data,
    isLoading: query.isFetching,
    fetchLastCard: query.refetch,
  };
};
