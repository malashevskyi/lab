/**
 * Manually triggers an 'input' event on the given textarea or input.
 * This ensures that React's onChange handler is triggered after programmatic changes.
 */
export function triggerInputEvent(
  inputElement: HTMLTextAreaElement | HTMLInputElement
): void {
  const inputEvent = new Event('input', { bubbles: true });
  inputElement.dispatchEvent(inputEvent);
}
