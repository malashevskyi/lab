import { GROUP_FLASHCARDS_URLS } from "../config/constants";

export function findGroupUrl(url: string): string | null {
  const matchingUrl = GROUP_FLASHCARDS_URLS.find((groupUrl) =>
    url.startsWith(groupUrl)
  );

  if (matchingUrl) return matchingUrl;

  return null;
}
