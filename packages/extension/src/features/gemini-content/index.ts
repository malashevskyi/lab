import { ApiError } from '../../services/ApiError';
import { insertTextIntoGeminiInput } from '../../utils/gemini-input';
import { observeAndInsertDeleteButton } from './delete-chat-button';

console.log('DeepRead: Gemini content script loaded on', window.location.href);

const getStoredPrompt = async (): Promise<string | null> => {
  try {
    const allData = await chrome.storage.local.get();

    let mostRecentPrompt: string | null = null;
    let mostRecentTime = 0;
    let keyToRemove: string | null = null;

    for (const [key, value] of Object.entries(allData)) {
      if (
        key.startsWith('geminiTab_') &&
        value &&
        typeof value === 'object' &&
        'prompt' in value &&
        'timestamp' in value
      ) {
        const data = value as { prompt: string; timestamp: number };
        if (data.timestamp > mostRecentTime) {
          mostRecentTime = data.timestamp;
          mostRecentPrompt = data.prompt;
          keyToRemove = key;
        }
      }
    }

    if (!mostRecentPrompt) return null;

    if (keyToRemove) {
      void chrome.storage.local.remove(keyToRemove);
    }

    return mostRecentPrompt;
  } catch (error) {
    ApiError.fromUnknown(error, {
      clientMessage: 'Failed to retrieve stored prompt for Gemini AI.',
    }).notify();
    return null;
  }
};

const findAndFillInput = (prompt: string) => {
  // Try to insert text using the utility function
  if (!insertTextIntoGeminiInput(prompt, false)) {
    // input element is not loaded yet
    return false;
  }

  const findAndClickSendButton = () => {
    const sendButton = document.querySelector('button.send-button');

    if (sendButton && !(sendButton instanceof HTMLButtonElement)) {
      ApiError.notifyAndCapture('Send button is not an HTMLButtonElement');
      return false;
    }

    if (
      sendButton &&
      sendButton.getAttribute('aria-disabled') !== 'true' &&
      !sendButton.hasAttribute('disabled')
    ) {
      sendButton.click();
      return true;
    }
    return false;
  };

  // Try immediately first
  if (findAndClickSendButton()) return true;
  // If not found, use observer to wait for button to become enable
  const sendButtonObserver = new MutationObserver((_mutations, obs) => {
    if (findAndClickSendButton()) {
      obs.disconnect();
    }
  });

  sendButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-disabled', 'disabled'],
  });

  setTimeout(() => sendButtonObserver.disconnect(), 5000);

  return true;
};

// inject selected text from previous page into Gemini input field
const handleAutoInjection = async () => {
  const prompt = await getStoredPrompt();
  // just regular gemini page opening without prompt
  if (!prompt) return;

  // in case the input is already there
  if (findAndFillInput(prompt)) return;

  // wait for the input field to appear
  const observer = new MutationObserver((_mutations, obs) => {
    if (findAndFillInput(prompt)) obs.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => observer.disconnect(), 10000);
};

void handleAutoInjection();

// Initialize delete button functionality
observeAndInsertDeleteButton();
