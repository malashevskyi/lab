import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../../store';
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';
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
import { useGetLastFlashcard } from '../../../hooks/useGetLastFlashcard';
import { LastFlashcard } from '../LastFlashcard';

interface FormValues {
  chunks: Array<{ text: string }>;
  title: string;
}

/**
 * @description Form component for managing and creating a flashcard from selected chunks.
 */
export const FlashcardCreator: React.FC = () => {
  const rawChunks = useAppStore((state) => state.flashcard.chunks);
  const initialTitle = useAppStore((state) => state.flashcardCreator.title);
  const { createFlashcard, isCreating } = useCreateFlashcard();
  const { lastCardData, isLoading, fetchLastCard } = useGetLastFlashcard();
  const [isShowingLastCard, setIsShowingLastCard] = useState(false);
  // we show last card automatically if there are no chunks to create a new one
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!rawChunks.length) {
        setIsShowingLastCard(true);
        void fetchLastCard();
      } else {
        setIsShowingLastCard(false);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [rawChunks, fetchLastCard]);

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

  const handleToggleShowLastCard = async () => {
    if (isShowingLastCard) {
      setIsShowingLastCard(false);
    } else {
      await fetchLastCard();
      setIsShowingLastCard(true);
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form className="h-full flex flex-col">
        <FieldArray name="chunks">
          {(arrayHelpers) => (
            <div className="flex flex-col h-full space-y-3">
              <LastFlashcard
                flashcard={lastCardData}
                isVisible={isShowingLastCard}
              />

              {!isShowingLastCard && (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  <Field name="title">
                    {({ field }: FieldProps) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Flashcard Title (Context)"
                        className="w-full p-2 mb-3 border rounded-md text-sm font-semibold"
                      />
                    )}
                  </Field>
                  {formik.values.chunks.map((_, index) => (
                    <ChunkInput
                      key={index}
                      index={index}
                      onRemove={() => arrayHelpers.remove(index)}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => arrayHelpers.push({ text: '' })}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Add new chunk"
                >
                  <FaPlus />
                </button>
                <button
                  type="button"
                  onClick={handleToggleShowLastCard}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded flex items-center gap-2 transition-colors"
                  title={
                    isShowingLastCard
                      ? 'Hide last card'
                      : 'Show last created card'
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Loading...'
                  ) : isShowingLastCard ? (
                    <>
                      <FaEyeSlash /> <span>Hide Last</span>
                    </>
                  ) : (
                    <>
                      <FaEye /> <span>Show Last</span>
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className="p-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors"
                  title="Create flashcard from selection"
                  disabled={isCreating}
                >
                  <span>{isCreating ? 'Creating...' : 'Create Card'}</span>
                </button>
              </div>
            </div>
          )}
        </FieldArray>
      </Form>
    </FormikProvider>
  );
};
