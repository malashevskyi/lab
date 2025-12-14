export function findGroupUrl(url: string, groupUrls: string[]): string | null {
  if (!groupUrls.length) return null;
  const matchingUrl = groupUrls.find((groupUrl) => url.startsWith(groupUrl));

  if (matchingUrl) return matchingUrl;

  return null;
}
