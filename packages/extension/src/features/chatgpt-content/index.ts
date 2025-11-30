import { observeAndInsertDeleteButton } from './delete-chat-button';

console.log(
  'Assistant: ChatGPT content script loaded on',
  window.location.href
);

// Initialize delete button
observeAndInsertDeleteButton();
