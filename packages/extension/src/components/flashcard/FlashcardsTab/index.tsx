import { useEffect } from 'react';
import { useFlashcardStore } from '../../../store/flashcardStore';
import { useGetFlashcardsByUrl } from '../../../hooks/useGetFlashcardsByUrl';
import { FlashCard } from '../FlashCard';

export const FlashcardsTab: React.FC = () => {
  const setFlashcards = useFlashcardStore((state) => state.setFlashcards);
  const flashcards = useFlashcardStore((state) => state.flashcards);

  const { flashcardsData, isLoading } = useGetFlashcardsByUrl(
    window.location.href
  );

  useEffect(() => {
    if (flashcardsData) {
      setFlashcards(flashcardsData);
    }
  }, [flashcardsData, setFlashcards]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg
          className="h-8 w-8 animate-spin text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  const flashcardsList = Array.from(flashcards.values());

  if (flashcardsList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
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
          <p className="font-medium">No flashcards found</p>
          <p className="text-xs mt-1">
            Create flashcards for this page to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto space-y-3 pr-2">
      {flashcardsList
        .filter((card) => card !== null)
        .map((flashcard) => (
          <FlashCard key={flashcard.id} flashcard={flashcard} />
        ))}
    </div>
  );
};
