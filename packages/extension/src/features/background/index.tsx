import * as Sentry from '@sentry/react';
import {
  MessageType,
  type ExtensionMessage,
} from '../../types/sentry-messages';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
  debug: false,
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    console.log('🚀 ~ message:', message);
    if (message.type === MessageType.SENTRY_CAPTURE) {
      const error = new Error(message.error);
      if (message.stack) {
        error.stack = message.stack;
      }

      Sentry.captureException(error, {
        extra: message.extra,
        tags: message.tags,
        contexts: {
          chrome: {
            sender: sender.tab?.url || sender.url || 'unknown',
          },
        },
      });

      sendResponse({ success: true });
    } else if (message.type === MessageType.SENTRY_MESSAGE) {
      Sentry.captureMessage(message.message, {
        level: message.level,
        extra: message.extra,
      });

      sendResponse({ success: true });
    } else if (message.type === MessageType.AI_CHAT_PROMPT) {
      console.log('Background: Received openGeminiChat message', message);
      // Open new tab with Gemini AI chat
      chrome.tabs
        .create({
          url: 'https://gemini.google.com/',
          active: true,
        })
        .then((tab) => {
          // Store the tab ID and prompt for later use
          if (tab.id) {
            const storageKey = `geminiTab_${tab.id}`;
            const storageData = {
              prompt: message.prompt,
              timestamp: Date.now(),
            };
            console.log(
              'Background: Storing data with key:',
              storageKey,
              storageData
            );

            void chrome.storage.local.set({
              [storageKey]: storageData,
            });
          }
          sendResponse({ success: true, tabId: tab.id });
        })
        .catch((error) => {
          console.error('Failed to open Gemini tab:', error);
          sendResponse({ success: false, error: error.message });
        });

      // Keep the message channel open for async response (sendResponse)
      return true;
    }

    return true;
  }
);
