/**
 * @function areRangesEqual
 * @description Compares two DOM Range objects to determine if they select the exact same content.
 * @param {Range} r1 - The first range.
 * @param {Range} r2 - The second range.
 * @returns {boolean} - True if the ranges are identical, false otherwise.
 */
export const areRangesEqual = (r1: Range, r2: Range): boolean => {
  if (!r1 || !r2) return false;

  return (
    r1.startContainer === r2.startContainer &&
    r1.endContainer === r2.endContainer &&
    r1.startOffset === r2.startOffset &&
    r1.endOffset === r2.endOffset
  );
};
