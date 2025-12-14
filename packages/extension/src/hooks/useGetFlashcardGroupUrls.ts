import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { assistantApi } from "../services/api";
import { fromUnknown } from "../services/errorUtils";
import { useAppStore } from "../store";

export const FLASHCARD_GROUP_URLS_QUERY_KEY = "flashcardGroupUrls";

export const useGetFlashcardGroupUrls = () => {
  const isPopupOpen = useAppStore((s) => s.popup.isOpen);
  const activeTab = useAppStore((s) => s.popup.activeTab);
  const shouldFetch =
    isPopupOpen &&
    ["flashcards", "last-flashcard", "new-flashcard"].includes(activeTab);

  const query = useQuery({
    queryKey: [FLASHCARD_GROUP_URLS_QUERY_KEY],
    queryFn: async () => {
      const response = await assistantApi.get<string[]>(
        "/flashcards/group-urls"
      );
      return response.data;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
    enabled: shouldFetch,
  });

  useEffect(() => {
    if (query.error) {
      fromUnknown(query.error, {
        clientMessage: "Failed to fetch flashcard group URLs.",
        notify: true,
      });
    }
  }, [query.error]);

  return {
    groupUrls: query.data || [],
  };
};
