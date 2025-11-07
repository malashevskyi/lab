import { sanitizeMarkdownContent } from './sanitizeMarkdownContent.js';

interface SanitizedResponse {
  question: string;
  answer: string;
}

export const sanitizeResponse = (
  markdownQuestion: string,
  markdownAnswer: string,
): SanitizedResponse => {
  const sanitizedQuestion = sanitizeMarkdownContent(markdownQuestion || '');
  const sanitizedAnswer = sanitizeMarkdownContent(markdownAnswer || '');

  return {
    question: sanitizedQuestion,
    answer: sanitizedAnswer,
  };
};
