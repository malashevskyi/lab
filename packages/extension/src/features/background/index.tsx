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
    }

    return true;
  }
);
