import type { ToolbarType } from '../types';
import { getFormatSymbols } from './getFormatSymbols';
import { getTextareaSelection } from './getTextareaSelection';
import { triggerInputEvent } from './triggerInputEvent';

/**
 * Handles markdown text formatting for textarea.
 * Adds or removes markdown symbols based on selection.
 */
export function formatText(
  formatType: ToolbarType,
  textarea: HTMLTextAreaElement
) {
  const selection = getTextareaSelection(textarea);
  if (!selection) return;

  const { beforeText, selectedText, afterText, start } = selection;
  const { prefix, suffix } = getFormatSymbols(formatType);

  // CASE 1: Unwrap
  const isWrapped =
    selectedText.startsWith(prefix) && selectedText.endsWith(suffix);

  if (isWrapped) {
    const unwrapped = selectedText.slice(
      prefix.length,
      selectedText.length - suffix.length
    );

    textarea.value = beforeText + unwrapped + afterText;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + unwrapped.length;

    triggerInputEvent(textarea);
    textarea.focus();
    return;
  }

  // CASE 2: Wrap selected text
  if (selectedText.length > 0) {
    const wrapped = prefix + selectedText + suffix;

    textarea.value = beforeText + wrapped + afterText;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + wrapped.length;

    triggerInputEvent(textarea);
    textarea.focus();
    return;
  }

  // CASE 3: No selection → insert symbol pair
  const inserted = prefix + suffix;

  textarea.value = beforeText + inserted + afterText;
  textarea.selectionStart = textarea.selectionEnd = start + prefix.length;

  triggerInputEvent(textarea);
  textarea.focus();
}
