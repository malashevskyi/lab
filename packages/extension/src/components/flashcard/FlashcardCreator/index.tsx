import React from "react";
import { useAppStore } from "../../../store";
import { FaPlus } from "react-icons/fa";
import {
  Field,
  Form,
  FormikProvider,
  useFormik,
  type FieldProps,
} from "formik";
import { ChunkInput } from "../ChunkInput";
import { usePersistedTitle } from "../../../hooks/usePersistedTitle";
import { useCreateFlashcard } from "../../../hooks/useCreateFlashcard";
import { useSaveChunks } from "../../../hooks/useSaveChunks";
import TextareaAutosize from "react-textarea-autosize";
import { normalizeUrl } from "../../../utils/normalizeUrl";
import { useGetFlashcardGroupUrls } from "../../../hooks/useGetFlashcardGroupUrls";

interface FormValues {
  chunks: Array<{ text: string }>;
  title: string;
}

/**
 * @description Simplified form component for creating a flashcard from selected chunks (Tab content).
 */
export const FlashcardCreator: React.FC = () => {
  const rawChunks = useAppStore((state) => state.flashcardCreator.chunks);
  const initialTitle = useAppStore((state) => state.flashcardCreator.title);
  const removeFlashcardChunkByIndex = useAppStore(
    (state) => state.removeFlashcardChunkByIndex
  );
  const addEmptyFlashcardChunk = useAppStore(
    (state) => state.addEmptyFlashcardChunk
  );
  const updateFlashcardChunkText = useAppStore(
    (state) => state.updateFlashcardChunkText
  );
  const { createFlashcard, isCreating } = useCreateFlashcard();
  const { saveChunks, isSaving } = useSaveChunks();
  const { groupUrls } = useGetFlashcardGroupUrls();

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
        sourceUrl: normalizeUrl(window.location.href, groupUrls),
      });
    },
  });

  usePersistedTitle(formik.values, formik.setFieldValue);

  const handleRemoveChunk = (index: number) => {
    removeFlashcardChunkByIndex(index);
  };

  return (
    <div className="space-y-3">
      <FormikProvider value={formik}>
        <Form className="space-y-3">
          <div className="flex gap-2 flex-nowrap items-start">
            <button
              type="button"
              onClick={saveChunks}
              className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded flex items-center gap-2 transition-colors"
              title="Save chunks to database"
              disabled={isSaving || rawChunks.length === 0}
            >
              <span className="whitespace-nowrap">
                {isSaving ? "Saving..." : "Save Chunks"}
              </span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded flex items-center gap-2 transition-colors"
              title="Create flashcard from selection"
              disabled={isCreating}
            >
              <span className="whitespace-nowrap">
                {isCreating ? "Creating..." : "Create Card"}
              </span>
            </button>

            {/* Title field */}
            <Field name="title">
              {({ field }: FieldProps) => (
                <TextareaAutosize
                  {...field}
                  placeholder="Flashcard Title (Context)"
                  className="w-full p-2 border rounded-md text-sm font-semibold resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  minRows={1}
                  onChange={field.onChange}
                />
              )}
            </Field>
          </div>

          <div className="space-y-3">
            {formik.values.chunks.map((_, index) => (
              <ChunkInput
                key={index}
                index={index}
                onRemove={() => handleRemoveChunk(index)}
                onTextChange={(text) => updateFlashcardChunkText(index, text)}
              />
            ))}
          </div>

          {/* Add chunk button at bottom */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => addEmptyFlashcardChunk()}
              className="p-2 text-gray-600 hover:bg-gray-100 border border-solid border-gray-300 rounded flex items-center justify-center gap-2 transition-colors"
              title="Add new chunk"
            >
              <FaPlus />
              <span>Add New Chunk</span>
            </button>
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
};
