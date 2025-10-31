import React from 'react';
import { Field, type FieldProps } from 'formik';
import { FaTimes } from 'react-icons/fa';

interface ChunkInputRowProps {
  index: number;
  onRemove: () => void;
}

/**
 * @description A single row in the FlashcardCreator form, containing inputs for a tag and text.
 */
export const ChunkInput: React.FC<ChunkInputRowProps> = ({
  index,
  onRemove,
}) => {
  return (
    <div className="flex items-start gap-2 group">
      {/* text area field */}
      <Field name={`chunks.${index}.text`}>
        {({ field }: FieldProps) => (
          <textarea
            {...field}
            placeholder="Text content"
            className="flex-1 p-2 border border-gray-200 border-solid rounded-md text-sm resize-y min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={1}
          />
        )}
      </Field>

      {/* tag field */}
      <Field name={`chunks.${index}.tag`}>
        {({ field }: FieldProps) => (
          <input
            {...field}
            type="text"
            placeholder="tag"
            className="w-10 p-2 border border-gray-200 border-solid rounded-md text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </Field>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 mt-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove chunk"
      >
        <FaTimes size={12} />
      </button>
    </div>
  );
};
