import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Prevents keyboard events from propagating to the host page (e.g., Udemy)
 * when user is typing in input fields within the popup.
 *
 * This hook should only be active when the popup is visible.
 * When popup is closed, all keyboard events should reach the host page normally.
 *
 * @param popupRef - Reference to the popup container element
 * @param isOpen - Whether the popup is currently visible
 */
export function usePreventHostKeyboardEvents(
  popupRef: RefObject<HTMLElement | null>,
  isOpen: boolean
) {
  useEffect(() => {
    // Only attach listeners when popup is open
    if (!isOpen) {
      return;
    }

    const handleKeyboardEvent = (e: KeyboardEvent) => {
      // Use composedPath to get the real target inside Shadow DOM
      // e.target gets retargeted to BODY when event crosses Shadow DOM boundary
      const path = e.composedPath();
      const realTarget = path[0] as HTMLElement;
      const isWithinPopup = path.some(
        (element) => element === popupRef.current
      );

      if (isWithinPopup) {
        // Check if we're focused on an input element (textarea, input, contenteditable)
        const isInputElement =
          realTarget.tagName === 'TEXTAREA' ||
          realTarget.tagName === 'INPUT' ||
          realTarget.isContentEditable;

        if (isInputElement) {
          // Only block specific keys that Udemy uses for video control shortcuts
          // Allow all other keys to work normally for text input
          const udemyShortcutKeys = [
            ' ', // Space - play/pause
            'f', // F - fullscreen
            'F', // F - fullscreen
            'm', // M - mute
            'M', // M - mute
            'k', // K - play/pause
            'K', // K - play/pause
            'j', // J - rewind 10s
            'J', // J - rewind 10s
            'l', // L - forward 10s
            'L', // L - forward 10s
            '<', // < - decrease speed
            '>', // > - increase speed
            'ArrowLeft', // Arrow left - rewind 5s
            'ArrowRight', // Arrow right - forward 5s
            'ArrowUp', // Arrow up - volume up
            'ArrowDown', // Arrow down - volume down
          ];

          // Only block these keys if they're pressed without modifiers (Ctrl, Alt, Cmd)
          // This allows Ctrl+A, Ctrl+C, etc. to work
          const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

          if (udemyShortcutKeys.includes(e.key) && !hasModifier) {
            // stopImmediatePropagation prevents ALL other listeners (including Udemy) from firing
            // We do NOT call preventDefault() because that would block text input
            e.stopImmediatePropagation();
          }
        }
      }
    };

    // Use capture phase to intercept events before they reach host page handlers
    // Listen to all keyboard events to fully block host page shortcuts
    // Use window instead of document to ensure we catch events even earlier
    window.addEventListener('keydown', handleKeyboardEvent, {
      capture: true,
    });
    window.addEventListener('keyup', handleKeyboardEvent, { capture: true });
    window.addEventListener('keypress', handleKeyboardEvent, {
      capture: true,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyboardEvent, {
        capture: true,
      });
      window.removeEventListener('keyup', handleKeyboardEvent, {
        capture: true,
      });
      window.removeEventListener('keypress', handleKeyboardEvent, {
        capture: true,
      });
    };
  }, [popupRef, isOpen]);
}
