import DOMPurify from 'isomorphic-dompurify';

interface SanitizedResponse {
  question: string;
  answer: string;
}

export const sanitizeResponse = (
  htmlQuestion: string,
  htmlAnswer: string,
): SanitizedResponse => {
  const sanitizedQuestion = DOMPurify.sanitize(htmlQuestion || '', {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'i', 'code', 'u', 'pre', 'ul', 'li'],
    ALLOWED_ATTR: ['class', 'data-language'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  });
  const sanitizedAnswer = DOMPurify.sanitize(htmlAnswer || '', {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'i', 'code', 'u', 'pre', 'ul', 'li'],
    ALLOWED_ATTR: ['class', 'data-language'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
  });

  return {
    question: sanitizedQuestion,
    answer: sanitizedAnswer,
  };
};
