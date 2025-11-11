import type { GetLastFlashcardResponseType } from '@lab/types/assistant/flashcards';
import { useAppStore } from '../../../store';
import { EditableHTML } from '../EditableHTML';

interface FlashCardProps {
  flashcard: GetLastFlashcardResponseType;
  isEditable?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  flashcard,
  isEditable = false,
}) => {
  const onLastFlashcardChange = useAppStore(
    (state) => state.onLastFlashcardChange
  );

  const editedQuestion = useAppStore(
    (state) => state.lastFlashcard.editedQuestion
  );
  const editedAnswer = useAppStore((state) => state.lastFlashcard.editedAnswer);

  if (!flashcard) return null;

  const handleQuestionChange = (newHtml: string) => {
    onLastFlashcardChange({
      hasChanges: newHtml !== flashcard?.question,
      editedQuestion: newHtml,
      id: flashcard?.id,
    });
  };

  const handleAnswerChange = (newHtml: string) => {
    onLastFlashcardChange({
      hasChanges: newHtml !== flashcard?.answer,
      editedAnswer: newHtml,
      id: flashcard?.id,
    });
  };

  return (
    <div className="mb-2 p-3 border border-solid border-gray-200 rounded-lg bg-gray-50">
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <div className="bg-white p-3 rounded border-l-4 border-solid border-blue-400">
            <div className="flex items-center justify-between">
              {flashcard.context && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {flashcard.context}
                </span>
              )}
            </div>
            {isEditable ? (
              <EditableHTML
                content={editedQuestion}
                onContentChange={handleQuestionChange}
                className="text-gray-800 leading-relaxed"
              />
            ) : (
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: flashcard.question }}
              />
            )}
          </div>

          <div className="bg-white p-3 rounded border-l-4 border-solid border-green-400">
            {isEditable ? (
              <EditableHTML
                content={editedAnswer}
                onContentChange={handleAnswerChange}
                className="text-gray-800 leading-relaxed"
              />
            ) : (
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: flashcard.answer }}
              />
            )}
          </div>

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
      </div>
    </div>
  );
};
