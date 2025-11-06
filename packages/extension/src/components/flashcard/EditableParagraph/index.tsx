import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import DOMPurify from 'dompurify';
import { htmlToMarkdown } from '../EditableHTML/utils/htmlToMarkdown';
import { markdownToHtml } from '../EditableHTML/utils/markdownToHtml';

interface EditableParagraphProps {
  html: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onContentChange: (newHtml: string) => void;
  className?: string;
}

/**
 * Component for rendering an editable paragraph that switches between display and edit modes
 */
export const EditableParagraph: React.FC<EditableParagraphProps> = ({
  html,
  isEditing,
  onStartEdit,
  onStopEdit,
  onContentChange,
  className = '',
}) => {
  const [markdownValue, setMarkdownValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Convert HTML to markdown when starting to edit
  useEffect(() => {
    if (isEditing) {
      const markdown = htmlToMarkdown(html);
      setMarkdownValue(markdown);
      // Focus textarea after a short delay to ensure it's rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [isEditing, html, htmlToMarkdown]);

  const handleClick = () => {
    if (!isEditing) {
      // Don't allow editing of code blocks
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const hasCodeBlock = tempDiv.querySelector('pre');

      if (!hasCodeBlock) {
        onStartEdit();
      }
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      // Convert markdown back to HTML and update
      const newHtml = markdownToHtml(markdownValue);
      onContentChange(newHtml);
      onStopEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownValue(e.target.value);
  };

  // Sanitize HTML for display
  const sanitizedHtml = DOMPurify.sanitize(html);

  // Check if this contains a code block
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedHtml;
  const hasCodeBlock = tempDiv.querySelector('pre');

  if (isEditing) {
    return (
      <div className={`editable-paragraph ${className}`}>
        <TextareaAutosize
          ref={textareaRef}
          value={markdownValue}
          onChange={handleTextareaChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-solid border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
          minRows={1}
          placeholder="Type your content... Use **bold**, *italic*, _underline_, `code`"
        />
      </div>
    );
  }

  return (
    <div
      ref={displayRef}
      className={`editable-paragraph p-2 rounded transition-colors ${className} ${
        hasCodeBlock
          ? 'cursor-default bg-gray-100'
          : 'cursor-pointer hover:bg-gray-50'
      }`}
      onClick={handleClick}
      title={hasCodeBlock ? 'Code blocks cannot be edited' : 'Click to edit'}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
