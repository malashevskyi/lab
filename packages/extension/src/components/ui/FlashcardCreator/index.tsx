import React from 'react';
import { useAppStore } from '../../../store';
import { FaPlus } from 'react-icons/fa';
import {
  Field,
  FieldArray,
  Form,
  FormikProvider,
  useFormik,
  type FieldProps,
} from 'formik';
import { ChunkInput } from '../ChunkInput';
import { usePersistedTitle } from '../../../hooks/usePersistedTitle';
import { useCreateFlashcard } from '../../../hooks/useCreateFlashcard';
import TextareaAutosize from 'react-textarea-autosize';

interface FormValues {
  chunks: Array<{ text: string }>;
  title: string;
}

/**
 * @description Simplified form component for creating a flashcard from selected chunks (Tab content).
 */
export const FlashcardCreator: React.FC = () => {
  const rawChunks = useAppStore((state) => state.flashcard.chunks);
  const initialTitle = useAppStore((state) => state.flashcardCreator.title);
  const { createFlashcard, isCreating } = useCreateFlashcard();

  const formik = useFormik<FormValues>({
    initialValues: {
      title: initialTitle,
      chunks: rawChunks.map((c) => ({ text: c.text })),
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      createFlashcard({
        title: values.title,
        chunks: values.chunks.map((c) => c.text),
        sourceUrl: window.location.href,
      });
    },
  });

  usePersistedTitle(formik.values, formik.setFieldValue);

  // Debug: if no chunks, show message
  if (rawChunks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No content selected</h3>
          <p className="text-sm">
            Select some text on the page to create a flashcard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FormikProvider value={formik}>
        <Form className="space-y-3">
          <FieldArray name="chunks">
            {(arrayHelpers) => (
              <>
                {/* Title field */}
                <Field name="title">
                  {({ field }: FieldProps) => (
                    <TextareaAutosize
                      {...field}
                      placeholder="Flashcard Title (Context)"
                      className="w-full p-2 border rounded-md text-sm font-semibold resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                      minRows={1}
                    />
                  )}
                </Field>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors"
                  title="Create flashcard from selection"
                  disabled={isCreating}
                >
                  <span>{isCreating ? 'Creating...' : 'Create Card'}</span>
                </button>

                <div className="space-y-3">
                  {formik.values.chunks.map((_, index) => (
                    <ChunkInput
                      key={index}
                      index={index}
                      onRemove={() => arrayHelpers.remove(index)}
                    />
                  ))}
                </div>

                {/* Add chunk button at bottom */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => arrayHelpers.push({ text: '' })}
                    className="p-2 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center gap-2 transition-colors"
                    title="Add new chunk"
                  >
                    <FaPlus />
                    <span>Add New Chunk</span>
                  </button>
                </div>
              </>
            )}
          </FieldArray>
        </Form>
      </FormikProvider>
    </div>
  );
};
