export const normalizeLanguage = (lang?: string): string => {
  if (!lang) return 'javascript';

  const normalized = lang.toLowerCase();

  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    html: 'markup',
    xml: 'markup',
  };

  return languageMap[normalized] || normalized;
};
