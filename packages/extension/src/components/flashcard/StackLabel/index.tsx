import React, { useState, useEffect } from 'react';
import { StackAutocomplete } from '../StackAutocomplete';

interface StackLabelProps {
  defaultValue: string | null;
  stacks: string[];
  onContextChange: (newContext: string) => void;
  isUpdating?: boolean;
}

export const StackLabel: React.FC<StackLabelProps> = ({
  defaultValue,
  stacks,
  onContextChange,
  isUpdating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(defaultValue);

  // Sync with prop changes (after successful update)
  useEffect(() => {
    setCurrentValue(defaultValue);
  }, [defaultValue]);

  const handleBlur = (value: string) => {
    setIsEditing(false);

    // Normalize: trim and check if changed
    const normalizedValue = value.trim();
    const normalizedDefault = (currentValue || '').trim();

    if (normalizedValue && normalizedValue !== normalizedDefault) {
      setCurrentValue(normalizedValue); // Optimistic update
      onContextChange(normalizedValue);
    }
  };

  if (!isEditing) {
    return (
      <span
        onClick={() => !isUpdating && setIsEditing(true)}
        className={`bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors ${
          isUpdating
            ? 'opacity-50 cursor-wait'
            : 'cursor-pointer hover:bg-blue-100'
        }`}
        title={isUpdating ? 'Updating...' : 'Click to edit stack'}
      >
        {currentValue}
      </span>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <StackAutocomplete
        items={stacks}
        defaultValue={currentValue || ''}
        onBlur={handleBlur}
      />
    </div>
  );
};
