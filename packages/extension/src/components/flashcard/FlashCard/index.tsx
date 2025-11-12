import type { FlashcardType } from '@lab/types/assistant/flashcards';
import { EditableHTML } from '../EditableHTML';
import { useUpdateFlashcard } from '../../../hooks/useUpdateFlashcard';
import { useQuery } from '@tanstack/react-query';

interface FlashCardProps {
  flashcardId: FlashcardType['id'];
}

export const FlashCard: React.FC<FlashCardProps> = ({ flashcardId }) => {
  const { updateFlashcard } = useUpdateFlashcard();
  const flashcard = useQuery<FlashcardType>({
    queryKey: ['flashcard', flashcardId],
    enabled: false,
  });

  if (!flashcard.data) return null;

  const handleQuestionChange = (newHtml: string) => {
    updateFlashcard(flashcard.data.id, newHtml, flashcard.data.answer);
  };

  const handleAnswerChange = (newHtml: string) => {
    updateFlashcard(flashcard.data.id, flashcard.data.question, newHtml);
  };

  return (
    <div className="mb-2 p-3 border border-solid border-gray-200 rounded-lg bg-gray-50 relative">
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <div className="bg-white p-3 rounded border-l-4 border-solid border-blue-400">
            <div className="flex items-center justify-between">
              {flashcard.data.context && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {flashcard.data.context}
                </span>
              )}
            </div>
            <EditableHTML
              content={flashcard.data.question}
              onContentChange={handleQuestionChange}
              className="text-gray-800 leading-relaxed"
            />
          </div>

          <div className="bg-white p-3 rounded border-l-4 border-solid border-green-400">
            <EditableHTML
              content={flashcard.data.answer}
              onContentChange={handleAnswerChange}
              className="text-gray-800 leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="space-x-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                Level: {flashcard.data.level}
              </span>
              {flashcard.data.tags.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {flashcard.data.tags.join(', ')}
                </span>
              )}
            </div>
            <span className="text-xs">
              {new Date(flashcard.data.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
