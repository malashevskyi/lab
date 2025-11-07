import React from 'react';
import { TOOLBAR_BUTTONS } from './data/toolbarButtons';
import { getActiveTextarea } from './utils/getActiveTextarea';
import { formatText } from './utils/formatText';
import { useToolbarStore } from '../../../store/toolbarStore';

interface MarkdownToolbarProps {
  className?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  className = '',
}) => {
  const isToolbarVisible = useToolbarStore((state) => state.isToolbarVisible);

  if (!isToolbarVisible) return null;

  return (
    <div
      className={`flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 ${className}`}
    >
      {TOOLBAR_BUTTONS.map(({ iconClass, type, label, viewBox, pathD }) => (
        <button
          key={type}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const textarea = getActiveTextarea();
            if (textarea) formatText(type, textarea);
          }}
          title={label}
          aria-label={label}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            className={`octicon ${iconClass}`}
            viewBox={viewBox}
            width="16"
            height="16"
            fill="currentColor"
            style={{ verticalAlign: 'text-bottom' }}
          >
            <path d={pathD} />
          </svg>
        </button>
      ))}
    </div>
  );
};
