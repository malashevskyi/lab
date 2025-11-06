export const normalizeContentForComparison = (content: string): string => {
  return content.trim().replace(/\s+/g, ' ').trim();
};
