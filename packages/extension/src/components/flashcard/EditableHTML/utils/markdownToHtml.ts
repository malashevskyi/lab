const MARKDOWN: { regex: RegExp; replace: string }[] = [
  // Inline code
  {
    regex: /`([^`]+?)`/g,
    replace:
      '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>',
  },
  // Bold
  { regex: /\*\*(.+?)\*\*/g, replace: '<strong>$1</strong>' },
  // Italic
  { regex: /\*(.+?)\*/g, replace: '<em>$1</em>' },
  // Underline
  { regex: /_(.+?)_/g, replace: '<u>$1</u>' },
];

export function markdownToHtml(markdown: string): string {
  let result = markdown.trim();

  for (const rule of MARKDOWN) {
    result = result.replace(rule.regex, rule.replace);
  }

  return result;
}
