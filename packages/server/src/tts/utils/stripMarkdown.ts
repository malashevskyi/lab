export const stripMarkdown = (text: string): string => {
  if (!text) return '';

  let result = text;

  // Remove code blocks
  result = result.replace(/```[\s\S]*?```/g, '');
  // Remove images (must be before links)
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Remove links but keep text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove script tags with content
  result = result.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );
  // Remove HTML tags
  result = result.replace(/<[^>]+>/g, '');
  // Remove inline code (non-greedy to handle empty backticks after HTML removal)
  result = result.replace(/`[^`]*`/g, (match) => {
    // Extract content between backticks
    const content = match.slice(1, -1);
    return content;
  });

  // Remove bold and italic multiple times to handle nested formatting
  for (let i = 0; i < 3; i++) {
    result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
    result = result.replace(/\*([^*]+)\*/g, '$1');
  }

  // Remove strikethrough
  result = result.replace(/~~([^~]+)~~/g, '$1');
  // Remove headers
  result = result.replace(/^#{1,6}\s+/gm, '');
  // Remove blockquotes
  result = result.replace(/^>\s+/gm, '');
  // Remove horizontal rules
  result = result.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');
  // Remove list markers
  result = result.replace(/^[\s]*[-*+]\s+/gm, '');
  result = result.replace(/^[\s]*\d+\.\s+/gm, '');
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ');
  // Trim
  result = result.trim();

  return result;
};
