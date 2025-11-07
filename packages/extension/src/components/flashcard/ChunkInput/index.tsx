import React from 'react';
import { Field, type FieldProps } from 'formik';
import { FaTimes } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';

interface ChunkInputRowProps {
  index: number;
  onRemove: () => void;
  onTextChange?: (text: string) => void;
}

/**
 * @description A single row in the FlashcardCreator form
 */
export const ChunkInput: React.FC<ChunkInputRowProps> = ({
  index,
  onRemove,
  onTextChange,
}) => {
  return (
    <div className="flex items-start gap-2 group">
      {/* text area field */}
      <Field name={`chunks.${index}.text`}>
        {({ field }: FieldProps) => (
          <TextareaAutosize
            {...field}
            placeholder="Text content"
            className="flex-1 p-2 border  border-gray-200 border-solid rounded-md text-sm resize-none min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            minRows={1}
            onChange={(e) => {
              field.onChange(e);
              onTextChange?.(e.target.value);
            }}
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
