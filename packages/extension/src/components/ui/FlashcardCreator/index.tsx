import React, { useMemo, useRef } from 'react';
import Draggable from 'react-draggable';
import { useAppStore } from '../../../store';
import { FaPlus, FaTimes } from 'react-icons/fa';

/**
 * @interface FlashcardCreator
 * @description A floating, draggable popup for managing and creating a flashcard from selected chunks.
 */

export const FlashcardCreator: React.FC = () => {
  const chunks = useAppStore((state) => state.flashcard.chunks);
  const position = useAppStore((state) => state.flashcardCreator.position);
  const setFlashcardCreatorPosition = useAppStore(
    (state) => state.setFlashcardCreatorPosition
  );
  const clearFlashcardChunks = useAppStore(
    (state) => state.clearFlashcardChunks
  );
  const nodeRef = useRef<HTMLDivElement>({} as unknown as HTMLDivElement);

  const chunkTexts = useMemo(() => {
    return chunks.map((chunk) => chunk.text).join(' ... ');
  }, [chunks]);

  if (chunks.length === 0) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={(_, data) => {
        setFlashcardCreatorPosition({ x: data.x, y: data.y });
      }}
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className="absolute top-0 left-0 bg-white rounded-lg shadow-lg flex flex-col p-2 z-[999999999] w-80"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          border: '1px solid #c4c4c4',
        }}
      >
        <div className="drag-handle cursor-move w-full h-6 flex justify-center items-center">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-2 mb-2 text-sm text-gray-700 bg-gray-50 rounded max-h-40 overflow-y-auto">
          <p className="whitespace-pre-wrap">{chunkTexts}</p>
        </div>

        <div className="flex items-center justify-end gap-2 p-1">
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Clear selection"
            onClick={clearFlashcardChunks}
          >
            <FaTimes />
          </button>
          <button
            className="p-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-2"
            title="Create flashcard from selection"
            onClick={() => console.log('Create card clicked!')}
          >
            <FaPlus />
            <span>Create Card</span>
          </button>
        </div>
      </div>
    </Draggable>
  );
};
