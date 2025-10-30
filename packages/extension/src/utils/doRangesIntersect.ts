/**
 * @function doRangesIntersect
 * @description Checks if two DOM Range objects intersect. This version uses direct offset
 * comparison, assuming the ranges share a common container, which is true in our use case
 * due to `expandSelectionToFullWords`.
 * @param {Range} r1 - The first range.
 * @param {Range} r2 - The second range.
 * @returns {boolean} - True if the ranges intersect, false otherwise.
 */
export const doRangesIntersect = (r1: Range, r2: Range): boolean => {
  if (!r1 || !r2) {
    return false;
  }

  // Для надійності, якщо контейнери різні, вважаємо, що перетину немає.
  // В нашому випадку вони завжди будуть однакові.
  if (
    r1.startContainer !== r2.startContainer ||
    r1.endContainer !== r2.endContainer
  ) {
    return false;
  }

  // Класична перевірка перетину двох відрізків [a, b] і [c, d]: (a < d) && (b > c)
  const r1StartsBeforeR2Ends = r1.startOffset < r2.endOffset;
  const r1EndsAfterR2Starts = r1.endOffset > r2.startOffset;

  return r1StartsBeforeR2Ends && r1EndsAfterR2Starts;
};
