import React from 'react';
import { MessageType } from '../../../types/sentry-messages';
import { insertTextIntoGeminiInput } from '../../../utils/gemini-input';

interface GeminiButtonProps {
  selectedText: string;
  pageTitle: string;
  onHide: () => void;
}

/**
 * @description Floating button that appears near text selection to open Gemini AI chat
 */
export const GeminiButton: React.FC<GeminiButtonProps> = ({
  selectedText,
  pageTitle,
  onHide,
}) => {
  const handleGeminiClick = () => {
    const isGeminiPage = window.location.hostname === 'gemini.google.com';

    if (isGeminiPage) {
      // We're already on Gemini page - insert text directly into input
      const followUpPrompt = `Part from your response: ${selectedText}

Explain this in details.`;

      insertTextIntoGeminiInput(followUpPrompt);
    } else {
      // We're on a different page - open new Gemini tab
      const prompt = `Article: "${pageTitle}"

Selected excerpt: "${selectedText}"

I don't understand this, please explain in more detail what this is and what it means?`;

      // Send message to background script to open new tab
      // Background script will store the prompt in chrome.storage.local
      void chrome.runtime.sendMessage({
        type: MessageType.AI_CHAT_PROMPT,
        prompt: prompt,
      });
    }

    onHide();
  };

  return (
    <button
      onClick={handleGeminiClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
      title="Ask Gemini AI about this text"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>Ask Gemini</span>
    </button>
  );
};
