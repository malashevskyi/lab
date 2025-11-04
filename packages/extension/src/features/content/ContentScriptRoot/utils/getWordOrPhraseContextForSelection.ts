import {
  ALLOWED_COPY_NODE_TYPES,
  MAX_CONTEXT_LENGTH,
  PHRASE_OR_WORD_LENGTH_THRESHOLD,
} from '../../../../config/constants';
import { refineLargeContext } from './refineLargeContext';
import getSentencesFromText from './getSentencesFromText';
import { ApiError } from '../../../../services/ApiError';

/**
 * Extracts the most relevant and appropriately sized block of text surrounding a user's selection for AI analysis.
 */
export const getWordOrPhraseContextForSelection = (
  selection: Selection
): string | void => {
  if (selection.rangeCount === 0) return '';

  const cleanText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  };

  const range = selection.getRangeAt(0);

  if (
    !ALLOWED_COPY_NODE_TYPES.includes(range.commonAncestorContainer.nodeType)
  ) {
    ApiError.notifyAndCapture(
      'Selection is too complex. Please select plain text.'
    );
    selection.removeAllRanges();
    return;
  }

  const startNode = range.startContainer.parentElement;

  if (!startNode) {
    ApiError.notifyAndCapture(
      'Could not determine the start node of the selection.'
    );
    selection.removeAllRanges();
    return;
  }

  const selectedText = cleanText(selection.toString());

  const isPhraseOrWord =
    selectedText.split(' ').length <= PHRASE_OR_WORD_LENGTH_THRESHOLD;
  let currentNode = range.commonAncestorContainer;
  let contextText = cleanText(currentNode.textContent);

  if (!isPhraseOrWord) return contextText;

  let parent = currentNode.parentElement?.cloneNode(true) as
    | Element // because we clone an Element
    | undefined;

  while (parent && contextText.length < MAX_CONTEXT_LENGTH) {
    const parentText = cleanText(parent.textContent);

    parent.querySelectorAll('style, script').forEach((el) => el.remove());

    const currentContextSentenceCount =
      getSentencesFromText(contextText).length;

    if (
      parentText.length > MAX_CONTEXT_LENGTH &&
      currentContextSentenceCount < 3
    ) {
      contextText = refineLargeContext(parentText, contextText);
      break;
    }

    contextText = parentText;
    currentNode = parent;
    parent = currentNode.parentElement?.cloneNode(true) as Element | undefined; // because we clone an Element
  }

  return contextText;
};
