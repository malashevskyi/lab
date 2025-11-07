/**
 * Udemy Site Modifier
 *
 * Modifies Udemy's transcript functionality to:
 * - Remove underline on hover
 * - Remove click-to-seek functionality on text
 * - Add dedicated seek button for each transcript line
 * - Make text selectable for flashcard creation
 *
 * Important: We use data-purpose attributes instead of generated class names
 * (like .transcript--cue-container--Vuwj6) to ensure stability across Udemy updates.
 */

import type { SiteModifier } from '../types';
import styles from './styles.css?inline';

let styleElement: HTMLStyleElement | null = null;

/**
 * Add seek button to transcript cue
 */
const addSeekButton = (cueContainer: HTMLElement): void => {
  // Skip if button already exists
  if (cueContainer.querySelector('.deepread-seek-button')) {
    return;
  }

  const cue = cueContainer.querySelector<HTMLElement>(
    '[data-purpose="transcript-cue"], [data-purpose="transcript-cue-active"]'
  );

  if (!cue) return;

  // Create wrapper for button + content
  const wrapper = document.createElement('div');
  wrapper.className = 'deepread-seek-button-container';

  // Create seek button
  const seekButton = document.createElement('button');
  seekButton.className = 'deepread-seek-button';
  seekButton.title = 'Go to this time in video';
  seekButton.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5v14l11-7z"/>
    </svg>
  `;

  // Add click handler that simulates click on the cue element
  // We need to temporarily allow clicks to pass through
  seekButton.addEventListener('click', (e) => {
    e.stopPropagation();

    // Create and dispatch a new click event on the cue
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    // Temporarily mark that this is from our button
    (clickEvent as any).fromDeepReadButton = true;
    cue.dispatchEvent(clickEvent);
  });

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'deepread-transcript-content';

  // Move cue's content to wrapper (but keep the cue element structure)
  while (cue.firstChild) {
    contentWrapper.appendChild(cue.firstChild);
  }

  // Rebuild structure: wrapper > [button, content]
  wrapper.appendChild(seekButton);
  wrapper.appendChild(contentWrapper);
  cue.appendChild(wrapper);
};

/**
 * Process transcript cue containers to add seek buttons and disable text clicks
 */
const processTranscriptCues = (): void => {
  // Use stable selector - find transcript panel, then get all containers with cues
  const transcriptPanel = document.querySelector(
    '[data-purpose="transcript-panel"]'
  );
  if (!transcriptPanel) return;

  const cueContainers = transcriptPanel.querySelectorAll<HTMLElement>(
    'p[data-purpose="transcript-cue"], p[data-purpose="transcript-cue-active"]'
  );

  cueContainers.forEach((cue) => {
    // Get parent container (the div wrapper around the p element)
    const container = cue.parentElement;
    if (!container) return;

    // Add seek button
    addSeekButton(container);

    // Skip if already processed
    if (cue.hasAttribute('data-deepread-processed')) {
      return;
    }

    // Mark as processed
    cue.setAttribute('data-deepread-processed', 'true');

    // Make sure the element is not focusable
    cue.setAttribute('tabindex', '-1');
    cue.removeAttribute('role');

    // Prevent clicks on the text content (but not on the button)
    const contentWrapper = cue.querySelector('.deepread-transcript-content');
    if (contentWrapper) {
      contentWrapper.addEventListener(
        'click',
        (e) => {
          // Only prevent clicks that are NOT from our seek button
          if (!(e as any).fromDeepReadButton) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        },
        { capture: true }
      );
    }
  });
};

/**
 * Initialize Udemy modifications
 */
const initialize = (): void => {
  console.log('[DeepRead] Initializing Udemy site modifier');

  // Inject custom styles - check both variable and DOM to prevent duplicates
  if (!styleElement && !document.getElementById('deepread-udemy-modifier')) {
    styleElement = document.createElement('style');
    styleElement.id = 'deepread-udemy-modifier';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  } else if (!styleElement) {
    // Style exists in DOM but not in variable (e.g., after page navigation)
    styleElement = document.getElementById(
      'deepread-udemy-modifier'
    ) as HTMLStyleElement;
  }

  // Disable click handlers on existing transcript cues
  processTranscriptCues();

  // Watch for dynamically added transcript cues
  const observer = new MutationObserver((mutations) => {
    let shouldProcessCues = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the added node or its children contain transcript cues
            if (
              node.matches?.('[data-purpose^="transcript-cue"]') ||
              node.querySelector?.('[data-purpose^="transcript-cue"]')
            ) {
              shouldProcessCues = true;
            }
          }
        });
      }
    }

    if (shouldProcessCues) {
      // Use requestIdleCallback to defer processing if available
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => processTranscriptCues());
      } else {
        setTimeout(processTranscriptCues, 0);
      }
    }
  });

  // Observe the transcript panel for changes
  const transcriptPanel = document.querySelector(
    '[data-purpose="transcript-panel"]'
  );
  if (transcriptPanel) {
    observer.observe(transcriptPanel, {
      childList: true,
      subtree: true,
    });
  } else {
    // If transcript panel doesn't exist yet, observe the entire document
    // until we find it
    const documentObserver = new MutationObserver(() => {
      const panel = document.querySelector('[data-purpose="transcript-panel"]');
      if (panel) {
        observer.observe(panel, {
          childList: true,
          subtree: true,
        });
        documentObserver.disconnect();
      }
    });

    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Store observer for cleanup
  (initialize as any).observer = observer;
};

/**
 * Cleanup Udemy modifications
 */
const cleanup = (): void => {
  console.log('[DeepRead] Cleaning up Udemy site modifier');

  // Remove injected styles
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }

  // Disconnect observer
  const observer = (initialize as any).observer as MutationObserver | undefined;
  if (observer) {
    observer.disconnect();
  }
};

/**
 * Check if current URL is a Udemy course page
 */
const matches = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('udemy.com') &&
      urlObj.pathname.includes('/course/')
    );
  } catch {
    return false;
  }
};

export const udemyModifier: SiteModifier = {
  id: 'udemy',
  name: 'Udemy',
  matches,
  initialize,
  cleanup,
};
