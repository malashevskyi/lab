/**
 * Sanitize text content (everything except code blocks)
 * Preserve all whitespace and line breaks
 */
const sanitizeTextContent = (text: string): string => {
  // Remove HTML tags but preserve all whitespace, newlines, and markdown formatting
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>?/gm, ''); // Remove HTML tags but keep whitespace
};

/**
 * Split markdown content into parts and sanitize only non-code parts
 * Code blocks should remain unsanitized for react-simple-code-editor
 */
export const sanitizeMarkdownContent = (markdown: string): string => {
  if (!markdown) return '';

  const CODE_BLOCK = /\s*```[\w]*\n[\s\S]*?\n\s*```/g;
  const blockRegex = new RegExp(`(${CODE_BLOCK.source})`, 'g');

  let lastIndex = 0;
  let match;
  const parts: string[] = [];

  function handleTextBeforeMatchedBlock() {
    const textBefore = markdown.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(sanitizeTextContent(textBefore));
    }
  }

  function detectMatchedBlockType(blockMatch: string) {
    const trimmedBlock = blockMatch.trim();
    if (trimmedBlock.startsWith('```')) {
      // Code block - keep as is without sanitization
      parts.push(blockMatch);
    }
  }

  while ((match = blockRegex.exec(markdown)) !== null) {
    handleTextBeforeMatchedBlock();

    // get first capturing group
    const [, blockMatch] = match;
    detectMatchedBlockType(blockMatch);

    // update lastIndex to the end of the matched block
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last block
  const remainingText = markdown.slice(lastIndex);
  if (remainingText) {
    parts.push(sanitizeTextContent(remainingText));
  }

  // If no code blocks found, sanitize entire content
  if (parts.length === 0) {
    parts.push(sanitizeTextContent(markdown));
  }

  return parts.join('');
};
