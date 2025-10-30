/**
 * @function getAbsoluteOffsets
 * @description A helper function that traverses the DOM from a root node to calculate the
 * absolute start and end character offsets of a given Range.
 */
const getAbsoluteOffsets = (
  root: Node,
  range: Range
): { start: number; end: number } => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let charCount = 0;
  let start = -1;
  let end = -1;
  let currentNode: Node | null;

  while ((currentNode = walker.nextNode())) {
    if (start === -1 && currentNode === range.startContainer) {
      start = charCount + range.startOffset;
    }
    if (end === -1 && currentNode === range.endContainer) {
      end = charCount + range.endOffset;
    }

    if (start !== -1 && end !== -1) {
      break;
    }

    charCount += currentNode.textContent?.length || 0;
  }

  return { start, end };
};

/**
 * @function doRangesIntersect
 * @description The final and robust implementation. It calculates the numerical positions
 * of the start and end points of each range within their common ancestor and then performs
 * a simple mathematical intersection check.
 */
export const doRangesIntersect = (r1: Range, r2: Range): boolean => {
  if (!r1 || !r2) return false;

  let commonAncestor = r1.commonAncestorContainer;
  if (commonAncestor.nodeType !== Node.ELEMENT_NODE) {
    commonAncestor = commonAncestor.parentNode!;
  }
  while (
    commonAncestor &&
    !commonAncestor.contains(r2.commonAncestorContainer)
  ) {
    commonAncestor = commonAncestor.parentNode!;
  }

  if (!commonAncestor) return false;

  const offsets1 = getAbsoluteOffsets(commonAncestor, r1);
  const offsets2 = getAbsoluteOffsets(commonAncestor, r2);

  if ([offsets1.start, offsets1.end, offsets2.start, offsets2.end].includes(-1))
    return false;

  return offsets1.start < offsets2.end && offsets2.start < offsets1.end;
};
