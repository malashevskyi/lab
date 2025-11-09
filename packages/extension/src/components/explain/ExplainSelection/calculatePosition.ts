/**
 * Calculate position for the action buttons container, ensuring it stays within viewport bounds
 *
 * @param selectionRect - DOMRect of the selected text
 * @returns Position coordinates { x, y } in pixels relative to document
 */
export function calculatePosition(selectionRect: DOMRect): {
  x: number;
  y: number;
} {
  const BUTTON_OFFSET = 10; // Space between selection and button
  const CONTAINER_WIDTH = 160; // Approximate width of button container (with padding)
  const CONTAINER_HEIGHT = 110; // Approximate height of button container with 2 buttons (with padding and gap)

  let x = selectionRect.right + window.scrollX + BUTTON_OFFSET;
  let y = selectionRect.top + window.scrollY;

  // Check right edge of viewport
  const viewportWidth = window.innerWidth;
  const rightEdge = x + CONTAINER_WIDTH;

  if (rightEdge > viewportWidth + window.scrollX) {
    // Position to the left of selection instead
    x = selectionRect.left + window.scrollX - CONTAINER_WIDTH - BUTTON_OFFSET;

    // If still outside on the left, align to left edge with offset
    if (x < window.scrollX) {
      x = window.scrollX + BUTTON_OFFSET;
    }
  }

  // Check bottom edge of viewport
  const viewportHeight = window.innerHeight;
  const bottomEdge = y + CONTAINER_HEIGHT;

  if (bottomEdge > viewportHeight + window.scrollY) {
    // Position above selection instead
    y = selectionRect.top + window.scrollY - CONTAINER_HEIGHT - BUTTON_OFFSET;

    // If still outside on top, align to top edge with offset
    if (y < window.scrollY) {
      y = window.scrollY + BUTTON_OFFSET;
    }
  }

  return { x, y };
}
