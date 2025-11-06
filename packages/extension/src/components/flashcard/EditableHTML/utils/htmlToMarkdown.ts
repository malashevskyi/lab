import { decodeHtml } from './decodeHtml';

const TAGS: Record<string, (text: string) => string> = {
  STRONG: (t) => `**${t}**`,
  B: (t) => `**${t}**`,
  EM: (t) => `*${t}*`,
  I: (t) => `*${t}*`,
  U: (t) => `_${t}_`,
  CODE: (t) => `\`${t}\``,
};

export function htmlToMarkdown(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = node as HTMLElement;

    // Handle code blocks: <pre><code>...</code></pre>
    if (el.tagName === 'PRE') {
      return el.textContent || '';
    }

    // Recursively process child nodes
    const inner = Array.from(el.childNodes).map(walk).join('');

    const transform = TAGS[el.tagName];

    return transform ? transform(inner) : inner;
  }

  const markdown = Array.from(div.childNodes).map(walk).join('');

  return decodeHtml(markdown);
}
