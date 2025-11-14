import * as path from 'path';
import { extensionToLanguageMap } from '../constants';

/**
 * Determines the language identifier for syntax highlighting based on a filename.
 * @param fileName The name of the file (e.g., 'server.js').
 * @returns A language identifier (e.g., 'javascript') or 'plaintext' as a default.
 */
export function getLanguageId(fileName: string): string {
  if (!fileName) {
    return 'plaintext';
  }
  const extension = path.extname(fileName).toLowerCase();
  // Повертаємо знайдену мову або 'plaintext', якщо розширення не знайдено
  return extensionToLanguageMap[extension] || 'plaintext';
}
