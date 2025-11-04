/**
 * Utility function to insert text into Gemini input field
 * @param text - Text to insert into the input
 * @param focus - Whether to focus the input after insertion (default: true)
 * @returns boolean - Whether the insertion was successful
 */
export const insertTextIntoGeminiInput = (
  text: string,
  focus: boolean = true
): boolean => {
  const inputSelectors = [
    '.ql-editor[contenteditable="true"]',
    'rich-textarea .ql-editor',
    '[aria-label*="Enter a prompt"]',
    '[data-placeholder*="Ask Gemini"]',
  ];

  let inputElement: HTMLElement | null = null;

  for (const selector of inputSelectors) {
    inputElement = document.querySelector(selector);
    if (inputElement) break;
  }

  // input element is not loaded yet
  if (!inputElement) return false;

  inputElement.textContent = text;

  // Trigger events to make sure Gemini recognizes the input
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  inputElement.dispatchEvent(new Event('change', { bubbles: true }));

  if (focus) {
    // Focus the element and position cursor at the end
    inputElement.focus();
  }

  return true;
};
