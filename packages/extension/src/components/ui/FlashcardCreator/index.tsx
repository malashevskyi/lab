import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useAppStore } from '../../../store';
import { FaPlus } from 'react-icons/fa';
import { FieldArray, Form, FormikProvider, useFormik } from 'formik';
import { ChunkInput } from '../ChunkInput';
import { CloseButton } from '../CloseButton';

interface FormValues {
  chunks: Array<{ tag: string; text: string }>;
}

/**
 * @description A floating, draggable popup for managing and creating a flashcard from selected chunks.
 */
export const FlashcardCreator: React.FC = () => {
  const rawChunks = useAppStore((state) => state.flashcard.chunks);
  const position = useAppStore((state) => state.flashcardCreator.position);
  const setFlashcardCreatorPosition = useAppStore(
    (state) => state.setFlashcardCreatorPosition
  );
  const clearFlashcardChunks = useAppStore(
    (state) => state.clearFlashcardChunks
  );
  const nodeRef = useRef<HTMLDivElement>({} as unknown as HTMLDivElement);

  const formik = useFormik<FormValues>({
    initialValues: {
      chunks: rawChunks.map((c) => ({ text: c.text, tag: c.tag })),
    },

    enableReinitialize: true,
    onSubmit: (values) => {
      console.log('Submitting form with values:', values.chunks);
    },
  });

  if (rawChunks.length === 0) return null;

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
        <div className="flex items-center flex-nowrap">
          <div className="drag-handle cursor-move h-5 w-full flex-1  bg-gray-50"></div>

          <CloseButton onClose={clearFlashcardChunks} />
        </div>

        <FormikProvider value={formik}>
          <Form>
            <FieldArray name="chunks">
              {({ remove, push }) => (
                <div className="space-y-3">
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {formik.values.chunks.map((_, index) => (
                      <ChunkInput
                        key={index}
                        index={index}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 p-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => push({ tag: 'p', text: '' })}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Add new chunk"
                    >
                      <FaPlus />
                    </button>
                    <button
                      type="submit"
                      className="p-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-2"
                      title="Create flashcard from selection"
                    >
                      <span>Create Card</span>
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>
          </Form>
        </FormikProvider>
      </div>
    </Draggable>
  );
};
