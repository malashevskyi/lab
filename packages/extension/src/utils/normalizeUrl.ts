import { findGroupUrl } from "./findGroupUrl";

/**
 * Normalizes URLs for specific platforms to group related content together.
 *
 * @example
 * Udemy course URLs - removes lecture-specific parts
 * normalizeUrl('https://www.udemy.com/course/some-course-title/learn/lecture/185043436#overview')
 * Returns: 'https://www.udemy.com/course/some-course-title'
 *
 * @param url - The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string, groupUrls: string[]): string {
  try {
    const urlObj = new URL(url);

    const groupUrl = findGroupUrl(url, groupUrls);

    if (groupUrl) return groupUrl;

    // Udemy: remove everything after /course/{course-name}
    if (urlObj.hostname.includes("udemy.com")) {
      const pathMatch = urlObj.pathname.match(/^(\/course\/[^/]+)/);
      if (pathMatch) {
        return `${urlObj.origin}${pathMatch[1]}`;
      }
    }

    // For other platforms, return the original URL
    return url;
  } catch {
    // If URL parsing fails, return the original string
    return url;
  }
}
