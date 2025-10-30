import { ApiError } from '../../../../services/ApiError';

const PUNCTUATION_AND_SPACE_REGEX = /[.,:;!?\s]/;

/**
 * @function expandSelectionAcrossNodes
 * @description Expands a user's selection to encompass full words, even when the
 * selection spans across multiple DOM nodes (e.g., from a `<strong>` tag to a parent `<p>` tag).
 * It adjusts the start and end boundaries of the selection independently.
 * @param {Selection} selection - The original `Selection` object from `window.getSelection()`.
 * @returns {Selection} The modified `Selection` object with boundaries snapped to full words.
 */
export const expandSelectionAcrossNodes = (selection: Selection): Selection => {
  if (selection.rangeCount === 0) {
    return selection;
  }

  const range = selection.getRangeAt(0);
  const { startContainer, endContainer, startOffset, endOffset } = range;

  if (
    startContainer.nodeType !== Node.TEXT_NODE ||
    endContainer.nodeType !== Node.TEXT_NODE
  ) {
    return selection;
  }

  const startTextContent = startContainer.textContent || '';
  const endTextContent = endContainer.textContent || '';

  let newStartOffset = startOffset;
  let newEndOffset = endOffset;

  while (
    newStartOffset > 0 &&
    !PUNCTUATION_AND_SPACE_REGEX.test(startTextContent[newStartOffset - 1])
  ) {
    newStartOffset--;
  }

  while (
    newStartOffset < startTextContent.length &&
    PUNCTUATION_AND_SPACE_REGEX.test(startTextContent[newStartOffset])
  ) {
    newStartOffset++;
  }

  while (
    newEndOffset < endTextContent.length &&
    !PUNCTUATION_AND_SPACE_REGEX.test(endTextContent[newEndOffset])
  ) {
    newEndOffset++;
  }
  while (
    newEndOffset > 0 &&
    PUNCTUATION_AND_SPACE_REGEX.test(endTextContent[newEndOffset - 1])
  ) {
    newEndOffset--;
  }

  try {
    const newRange = document.createRange();
    newRange.setStart(startContainer, newStartOffset);
    newRange.setEnd(endContainer, newEndOffset);

    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch (error) {
    ApiError.fromUnknown(error, 'Error creating expanded range.').notify();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  return selection;
};
