/**
 * Site Modifiers Registry
 *
 * Central registry for all site-specific modifications.
 * To add a new platform:
 * 1. Create a new folder under site-modifiers/ (e.g., 'coursera')
 * 2. Implement the SiteModifier interface
 * 3. Import and add it to the modifiers array below
 */

import type { SiteModifier } from './types';
import { udemyModifier } from './udemy';

/**
 * Registry of all available site modifiers
 * Add new modifiers here as they are implemented
 */
const modifiers: SiteModifier[] = [
  udemyModifier,
  // courserModifier,
  // youtubeModifier,
];

/**
 * Active modifier instance
 */
let activeModifier: SiteModifier | null = null;

/**
 * Initialize site-specific modifications based on current URL
 */
export const initializeSiteModifiers = (): void => {
  const currentUrl = window.location.href;

  // Find matching modifier
  const matchingModifier = modifiers.find((modifier) =>
    modifier.matches(currentUrl)
  );

  // If we found a matching modifier and it's different from the active one
  if (matchingModifier && matchingModifier !== activeModifier) {
    // Cleanup previous modifier if exists
    if (activeModifier?.cleanup) {
      activeModifier.cleanup();
    }

    // Initialize new modifier
    console.log(`[DeepRead] Activating ${matchingModifier.name} modifier`);
    matchingModifier.initialize();
    activeModifier = matchingModifier;
  }
  // If no matching modifier but we have an active one, cleanup
  else if (!matchingModifier && activeModifier) {
    if (activeModifier.cleanup) {
      activeModifier.cleanup();
    }
    activeModifier = null;
  }
};

/**
 * Cleanup all active modifiers
 * Should be called when content script is unloaded
 */
export const cleanupSiteModifiers = (): void => {
  if (activeModifier?.cleanup) {
    activeModifier.cleanup();
    activeModifier = null;
  }
};

/**
 * Re-initialize site modifiers (useful for SPA navigation)
 */
export const reinitializeSiteModifiers = (): void => {
  cleanupSiteModifiers();
  initializeSiteModifiers();
};

// Listen for URL changes (for SPAs like Udemy)
let lastUrl = window.location.href;
const urlChangeObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('[DeepRead] URL changed, reinitializing site modifiers');
    reinitializeSiteModifiers();
  }
});

// Start observing URL changes
urlChangeObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Also listen to popstate events (browser back/forward)
window.addEventListener('popstate', () => {
  console.log('[DeepRead] Navigation detected (popstate)');
  reinitializeSiteModifiers();
});

// Also listen to pushState and replaceState
const originalPushState = history.pushState.bind(history);
const originalReplaceState = history.replaceState.bind(history);

history.pushState = function (...args) {
  originalPushState(...args);
  console.log('[DeepRead] Navigation detected (pushState)');
  reinitializeSiteModifiers();
};

history.replaceState = function (...args) {
  originalReplaceState(...args);
  console.log('[DeepRead] Navigation detected (replaceState)');
  reinitializeSiteModifiers();
};
