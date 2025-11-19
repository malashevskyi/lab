import type { GetLastFlashcardResponseType } from '@lab/types/assistant/flashcards';
import React from 'react';
import { FlashCard } from '../FlashCard';

export interface LastFlashcardProps {
  flashcard?: GetLastFlashcardResponseType | null;
  stacks: string[];
  isVisible: boolean;
}

export const LastFlashcard: React.FC<LastFlashcardProps> = ({
  flashcard,
  stacks,
  isVisible,
}) => {
  if (!isVisible) return null;

  if (!flashcard) {
    return (
      <div className="text-center text-gray-500 py-6">
        <svg
          className="mx-auto h-8 w-8 text-gray-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="font-medium">No flashcard found</p>
        <p className="text-xs mt-1">
          Create your first flashcard to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto space-y-3 pr-2">
      <FlashCard flashcardId={flashcard.id} stacks={stacks} />
    </div>
  );
};
