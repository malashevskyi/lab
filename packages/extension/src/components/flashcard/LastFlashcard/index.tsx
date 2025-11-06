import type { GetLastFlashcardResponseType } from '@lab/types/deep-read/flashcards';
import React, { useEffect, useState } from 'react';
import { EditableHTML } from '../EditableHTML';
import { useRegenerateFlashcard } from '../../../hooks/useRegenerateFlashcard';
import { useUpdateFlashcard } from '../../../hooks/useUpdateFlashcard';
import { FaRedo, FaSave } from 'react-icons/fa';

export interface LastFlashcardProps {
  flashcard?: GetLastFlashcardResponseType | null;
  isVisible: boolean;
}

export const LastFlashcard: React.FC<LastFlashcardProps> = ({
  flashcard,
  isVisible,
}) => {
  const { regenerateFlashcard, isRegenerating, canRegenerate } =
    useRegenerateFlashcard();
  const { updateFlashcard, isUpdating } = useUpdateFlashcard();

  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (flashcard) {
      setEditedQuestion(flashcard.question);
      setEditedAnswer(flashcard.answer);
      setHasChanges(false);
    }
  }, [flashcard]);

  const handleQuestionChange = (newHtml: string) => {
    setEditedQuestion(newHtml);
    if (flashcard) {
      const hasChanged =
        newHtml !== flashcard.question || editedAnswer !== flashcard.answer;
      setHasChanges(hasChanged);
    }
  };

  const handleAnswerChange = (newHtml: string) => {
    setEditedAnswer(newHtml);
    if (flashcard) {
      const hasChanged = newHtml !== flashcard.answer;
      setHasChanges(hasChanged);
    }
  };

  const handleUpdate = () => {
    if (flashcard && hasChanges) {
      updateFlashcard(flashcard.id, {
        question: editedQuestion,
        answer: editedAnswer,
      });
      setHasChanges(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="overflow-y-auto space-y-3 pr-2">
      <div className="mb-2 p-3 border border-solid border-gray-200 rounded-lg bg-gray-50">
        {flashcard ? (
          <div className="flex gap-3">
            {/* Main content column */}
            <div className="flex-1 space-y-3">
              {/* Question Section */}
              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    Question
                  </div>
                  {flashcard.context && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {flashcard.context}
                    </span>
                  )}
                </div>
                <EditableHTML
                  content={editedQuestion}
                  onContentChange={handleQuestionChange}
                  className="text-gray-800 leading-relaxed"
                />
              </div>

              {/* Answer Section */}
              <div className="bg-white p-3 rounded border-l-4 border-green-400">
                <div className="text-xs font-medium text-green-600 mb-2 uppercase tracking-wide">
                  Answer
                </div>
                <EditableHTML
                  content={editedAnswer}
                  onContentChange={handleAnswerChange}
                  className="text-gray-800 leading-relaxed"
                />
              </div>

              {/* Metadata */}
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="space-x-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    Level: {flashcard.level}
                  </span>
                  {flashcard.tags.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {flashcard.tags.join(', ')}
                    </span>
                  )}
                </div>
                <span className="text-xs">
                  {new Date(flashcard.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions column */}
            <div className="flex flex-col gap-2 min-w-[80px]">
              {hasChanges && (
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 border border-solid border-green-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Update flashcard changes"
                >
                  <FaSave
                    className={`w-3 h-3 ${isUpdating ? 'animate-pulse' : ''}`}
                  />
                  <span className="hidden sm:inline">
                    {isUpdating ? 'Updating...' : 'Update'}
                  </span>
                </button>
              )}
              {canRegenerate && (
                <button
                  onClick={regenerateFlashcard}
                  disabled={isRegenerating}
                  className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-solid border-blue-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Regenerate flashcard with same content"
                >
                  <FaRedo
                    className={`w-3 h-3 ${
                      isRegenerating ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
