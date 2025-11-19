import React from 'react';
import { LastFlashcard } from '../LastFlashcard';
import { useGetLastFlashcard } from '../../../hooks/useGetLastFlashcard';
import { useGetStacks } from '../../../hooks/useGetStacks';

/**
 * @description Tab content for displaying the last created flashcard
 */
export const LastFlashcardTab: React.FC = () => {
  const { lastCardData, isLoading } = useGetLastFlashcard();
  const { stacks, isLoading: isStacksLoading } = useGetStacks();

  if (isLoading || isStacksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading last flashcard...</div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <LastFlashcard
        flashcard={lastCardData}
        stacks={stacks}
        isVisible={true}
      />
    </div>
  );
};
