/**
 * Defines the threshold for what is considered a "phrase or word".
 * A selection is classified as a valid "phrase or word" for analysis if it
 * contains this number of words or fewer.
 */
export const PHRASE_OR_WORD_LENGTH_THRESHOLD = 5;

/**
 * The MAXIMUM number of characters for a context. This prevents sending overly large
 * and expensive payloads to the API. Approximately 3-4 sentences.
 */
export const MAX_CONTEXT_LENGTH = 600;

/**
 * List of DOM node types that are permitted for copy operations.
 * Contains the numeric values corresponding to `Node.ELEMENT_NODE` and `Node.TEXT_NODE`,
 */
export const ALLOWED_COPY_NODE_TYPES: number[] = [
  Node.ELEMENT_NODE,
  Node.TEXT_NODE,
];
