import { CodeSnippet } from '../types';
import { getLanguageId } from './getLanguageId';

/**
 * Formats an array of code snippets into a single Markdown string.
 * This function is the single source of truth for the 'answer' field format.
 * @param snippets An array of code snippets.
 * @returns A formatted Markdown string with language identifiers.
 */
export function formatSnippetsAsMarkdown(snippets: CodeSnippet[]): string {
  if (!snippets || snippets.length === 0) {
    return '';
  }

  return snippets
    .map((s) => {
      const languageId = getLanguageId(s.fileName);
      return `\`\`\`${languageId}\n${s.content}\n\`\`\``;
    })
    .join('\n\n');
}
