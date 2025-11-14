const path = require('path');
import { extensionToLanguageMap } from '../constants';
import { CodeSnippet } from '../types';

export function determinePrimaryLanguage(snippets: CodeSnippet[]): string {
  if (!snippets || snippets.length === 0) return '';
  const languageCounts: { [key: string]: number } = {};
  for (const snippet of snippets) {
    const ext = path.extname(snippet.fileName).toLowerCase();
    const lang = extensionToLanguageMap[ext];
    if (lang) languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  }
  return Object.keys(languageCounts).reduce(
    (a, b) => (languageCounts[a] > languageCounts[b] ? a : b),
    ''
  );
}
