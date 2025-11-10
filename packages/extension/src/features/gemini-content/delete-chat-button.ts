/**
 * Module for adding and managing the delete chat button in Gemini interface
 */

import { ApiError } from '../../services/ApiError';

interface WaitForElementOptions {
  timeout?: number;
  interval?: number;
  root?: HTMLElement | Document;
}

// Inline waitForElement to avoid module resolution issues
function waitForElement<T extends HTMLElement = HTMLElement>(
  selector: string,
  options: WaitForElementOptions = {}
): Promise<T | null> {
  const { timeout = 5000, interval = 100, root = document.body } = options;

  return new Promise((resolve) => {
    const existingElement = (
      root instanceof Document ? root : root
    ).querySelector<T>(selector);
    if (existingElement) {
      resolve(existingElement);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      if (observer) observer.disconnect();
    };

    timeoutId = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeout);

    intervalId = setInterval(() => {
      const element = (root instanceof Document ? root : root).querySelector<T>(
        selector
      );
      if (element) {
        cleanup();
        resolve(element);
      }
    }, interval);

    observer = new MutationObserver(() => {
      const element = (root instanceof Document ? root : root).querySelector<T>(
        selector
      );
      if (element) {
        cleanup();
        resolve(element);
      }
    });

    observer.observe(root instanceof Document ? root.body : root, {
      childList: true,
      subtree: true,
    });
  });
}

const DELETE_BUTTON_ID = 'deepread-gemini-delete-button';
const SPINNER_ID = 'deepread-delete-spinner';

/**
 * Creates a delete button with Google Material Design styling
 */
function createDeleteButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = DELETE_BUTTON_ID;
  button.className =
    'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-unthemed deepread-delete-chat-button';
  button.setAttribute('mat-icon-button', '');
  button.setAttribute('aria-label', 'Delete current chat');
  button.setAttribute('title', 'Delete chat');
  button.style.cssText = `
    margin-right: 8px;
    color: #5f6368;
    transition: all 0.2s ease;
  `;

  // Create button structure matching Material Design
  const ripple = document.createElement('span');
  ripple.className = 'mat-mdc-button-persistent-ripple mdc-icon-button__ripple';

  const iconContainer = document.createElement('div');

  // Create delete icon using Material Symbols
  const icon = document.createElement('mat-icon');
  icon.setAttribute('role', 'img');
  icon.setAttribute('fonticon', 'delete');
  icon.className =
    'mat-icon notranslate icon-filled gds-icon-l google-symbols mat-ligature-font mat-icon-no-color';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = 'delete';

  iconContainer.appendChild(icon);

  const focusIndicator = document.createElement('span');
  focusIndicator.className = 'mat-focus-indicator';

  const touchTarget = document.createElement('span');
  touchTarget.className = 'mat-mdc-button-touch-target';

  button.appendChild(ripple);
  button.appendChild(iconContainer);
  button.appendChild(focusIndicator);
  button.appendChild(touchTarget);

  // Hover effects
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = 'rgba(95, 99, 104, 0.08)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'transparent';
  });

  return button;
}

/**
 * Creates a loading spinner
 */
function createSpinner(): HTMLElement {
  const spinner = document.createElement('div');
  spinner.id = SPINNER_ID;
  spinner.style.cssText = `
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(95, 99, 104, 0.2);
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: deepread-spin 0.8s linear infinite;
    margin-right: 8px;
  `;

  // Add keyframes if not already present
  if (!document.querySelector('#deepread-spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'deepread-spinner-keyframes';
    style.textContent = `
      @keyframes deepread-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return spinner;
}

/**
 * Shows a loading spinner in place of the delete button
 */
function showSpinner(container: HTMLElement): HTMLElement | null {
  const button = container.querySelector(`#${DELETE_BUTTON_ID}`);
  if (button) {
    const spinner = createSpinner();
    button.replaceWith(spinner);
    return spinner;
  }
  return null;
}

/**
 * Removes the spinner from the container
 */
function removeSpinner(container: HTMLElement): void {
  const spinner = container.querySelector(`#${SPINNER_ID}`);
  if (spinner) {
    spinner.remove();
  }
}

/**
 * Clicks the delete button in the sidebar menu
 */
async function clickDeleteInMenu(): Promise<boolean> {
  try {
    // Find and click the actions menu button first
    const menuButton = document.querySelector<HTMLButtonElement>(
      'button.conversation-actions-menu-button[data-test-id="actions-menu-button"]'
    );

    if (!menuButton) {
      ApiError.notifyAndCapture('Actions menu button not found', {
        context: 'clickDeleteInMenu',
      });
      return false;
    }

    // Click to open menu
    menuButton.click();

    // Wait for menu to appear and find delete button
    const deleteButton = await waitForElement<HTMLButtonElement>(
      'button[data-test-id="delete-button"]',
      { timeout: 2000 }
    );

    if (!deleteButton) {
      ApiError.notifyAndCapture('Delete button not found in menu', {
        context: 'clickDeleteInMenu',
      });
      return false;
    }

    // Click delete
    deleteButton.click();
    return true;
  } catch (error) {
    ApiError.notifyAndCapture('Error clicking delete in menu', {
      context: 'clickDeleteInMenu',
      error,
    });
    return false;
  }
}

/**
 * Automatically confirms the delete dialog
 */
async function autoConfirmDelete(): Promise<boolean> {
  try {
    // Wait for the dialog to appear
    const confirmButton = await waitForElement<HTMLButtonElement>(
      'button[data-test-id="confirm-button"]',
      { timeout: 3000 }
    );

    if (!confirmButton) {
      ApiError.notifyAndCapture('Confirm button not found in dialog', {
        context: 'autoConfirmDelete',
      });
      return false;
    }

    // Small delay to ensure dialog is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click confirm
    confirmButton.click();
    return true;
  } catch (error) {
    ApiError.notifyAndCapture('Error confirming delete', {
      context: 'autoConfirmDelete',
      error,
    });
    return false;
  }
}

/**
 * Waits for the delete dialog to disappear (indicating successful deletion)
 */
async function waitForDeletionComplete(): Promise<boolean> {
  try {
    // Wait for dialog to disappear
    const dialogGone = await new Promise<boolean>((resolve) => {
      const checkInterval = 100;
      const maxWait = 5000;
      let elapsed = 0;

      const interval = setInterval(() => {
        const dialog = document.querySelector('mat-dialog-container');

        if (!dialog) {
          clearInterval(interval);
          resolve(true);
          return;
        }

        elapsed += checkInterval;
        if (elapsed >= maxWait) {
          clearInterval(interval);
          resolve(false);
        }
      }, checkInterval);
    });

    return dialogGone;
  } catch (error) {
    ApiError.notifyAndCapture('Error waiting for deletion', {
      context: 'waitForDeletionComplete',
      error,
    });
    return false;
  }
}

/**
 * Handles the complete delete chat flow
 */
async function handleDeleteChat(container: HTMLElement): Promise<void> {
  let spinnerShown = false;

  try {
    // Show spinner
    const spinner = showSpinner(container);
    spinnerShown = !!spinner;

    // Step 1: Click delete in menu
    const deleteClicked = await clickDeleteInMenu();
    if (!deleteClicked) {
      ApiError.notifyAndCapture('Failed to click delete button', {
        context: 'handleDeleteChat',
      });
      removeSpinner(container);
      // Re-insert the delete button
      await insertDeleteButton();
      return;
    }

    // Step 2: Auto-confirm the dialog
    const confirmed = await autoConfirmDelete();
    if (!confirmed) {
      ApiError.notifyAndCapture('Failed to confirm deletion', {
        context: 'handleDeleteChat',
      });
      removeSpinner(container);
      // Re-insert the delete button
      await insertDeleteButton();
      return;
    }

    // Step 3: Wait for deletion to actually complete (dialog disappears)
    const deletionComplete = await waitForDeletionComplete();

    if (!deletionComplete) {
      ApiError.notifyAndCapture(
        'Deletion may not have completed, but continuing...',
        {
          context: 'handleDeleteChat',
        }
      );
    }

    // Step 4: Remove spinner
    removeSpinner(container);

    // Re-insert the button for next time
    await insertDeleteButton();
  } catch (error) {
    ApiError.notifyAndCapture('Error in delete chat flow', {
      context: 'handleDeleteChat',
      error,
    });

    // Always remove spinner on error
    if (spinnerShown) {
      removeSpinner(container);
    }

    // Try to re-insert button
    await insertDeleteButton();
  }
}

/**
 * Checks if the actions menu (three dots) is available
 * Returns false if no menu exists (new chat with no saved chats)
 */
function isActionsMenuAvailable(): boolean {
  const menuButton = document.querySelector<HTMLButtonElement>(
    'button.conversation-actions-menu-button[data-test-id="actions-menu-button"]'
  );
  return !!menuButton;
}

/**
 * Inserts the delete button into the Gemini interface
 */
export async function insertDeleteButton(): Promise<boolean> {
  try {
    // Check if button already exists
    const existingButton = document.querySelector(`#${DELETE_BUTTON_ID}`);
    if (existingButton) {
      return true;
    }

    // Also check if spinner is present (don't add button while processing)
    const existingSpinner = document.querySelector(`#${SPINNER_ID}`);
    if (existingSpinner) {
      return false;
    }

    // Check if actions menu is available (if not, there's nothing to delete)
    const menuAvailable = isActionsMenuAvailable();
    if (!menuAvailable) {
      // No menu means no saved chats - don't show delete button
      return false;
    }

    // Wait for the trailing actions wrapper (where model picker and mic button are)
    const trailingActionsWrapper = await waitForElement<HTMLElement>(
      '.trailing-actions-wrapper',
      { timeout: 10000 }
    );

    if (!trailingActionsWrapper) {
      return false;
    }

    // Find the input buttons wrapper (contains mic and send buttons)
    const inputButtonsWrapper =
      trailingActionsWrapper.querySelector<HTMLElement>(
        '.input-buttons-wrapper-bottom'
      );

    if (!inputButtonsWrapper) {
      return false;
    }

    // Create and insert delete button at the beginning
    const deleteButton = createDeleteButton();

    // Add click handler
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      void handleDeleteChat(inputButtonsWrapper);
    });

    // Insert at the beginning of the wrapper
    inputButtonsWrapper.insertBefore(
      deleteButton,
      inputButtonsWrapper.firstChild
    );

    return true;
  } catch (error) {
    ApiError.notifyAndCapture('Error inserting delete button', {
      context: 'insertDeleteButton',
      error,
    });
    return false;
  }
}

/**
 * Observes DOM changes and inserts delete button when the interface is ready
 * Also tracks navigation between chats to re-insert button
 */
export function observeAndInsertDeleteButton(): void {
  let currentUrl = window.location.href;
  let insertionObserver: MutationObserver | null = null;

  const tryInsertButton = async () => {
    const success = await insertDeleteButton();
    if (success && insertionObserver) {
      insertionObserver.disconnect();
      insertionObserver = null;
    }
    return success;
  };

  const startObserving = () => {
    if (insertionObserver) {
      insertionObserver.disconnect();
    }

    insertionObserver = new MutationObserver(async () => {
      await tryInsertButton();
    });

    insertionObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Stop observing after 15 seconds
    setTimeout(() => {
      if (insertionObserver) {
        insertionObserver.disconnect();
        insertionObserver = null;
      }
    }, 15000);
  };

  // Try to insert immediately
  void tryInsertButton().then((success) => {
    if (!success) {
      startObserving();
    }
  });

  // Watch for URL changes (navigation between chats)
  const urlObserver = new MutationObserver(() => {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;

      // Remove old button if exists
      const oldButton = document.querySelector(`#${DELETE_BUTTON_ID}`);
      if (oldButton) {
        oldButton.remove();
      }

      // Wait a bit for new page to load, then try inserting
      setTimeout(() => {
        void tryInsertButton().then((success) => {
          if (!success) {
            startObserving();
          }
        });
      }, 1000);
    }
  });

  // Observe document title and body changes (Gemini is SPA)
  urlObserver.observe(document.querySelector('title') || document.head, {
    childList: true,
    subtree: true,
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });

  // Also listen to popstate events
  window.addEventListener('popstate', () => {
    currentUrl = window.location.href;

    const oldButton = document.querySelector(`#${DELETE_BUTTON_ID}`);
    if (oldButton) {
      oldButton.remove();
    }

    setTimeout(() => {
      void tryInsertButton().then((success) => {
        if (!success) {
          startObserving();
        }
      });
    }, 1000);
  });
}
