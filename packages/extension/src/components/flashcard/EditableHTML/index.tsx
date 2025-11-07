import React, { useState } from 'react';
import { CodeBlock } from '../CodeBlock';
import {
  BlockType,
  parseContentIntoBlocks,
} from './utils/parseContentIntoBlocks';
import { FlashcardListBlock } from '../FlashcardListBlock';
import { FlashcardTextBlock } from '../FlashcardTextBlock';

interface EditableHTMLProps {
  content: string;
  onContentChange: (newContent: string) => void;
  className?: string;
}

export const EditableHTML: React.FC<EditableHTMLProps> = ({
  content,
  onContentChange,
  className = '',
}) => {
  const [editingTextBlockIndex, setEditingTextBlockIndex] = useState<
    number | null
  >(null);
  const blocks = parseContentIntoBlocks(content);

  // Helper function to reconstruct markdown content from blocks
  const reconstructContent = () =>
    blocks
      .map((b) => {
        if (b.type === BlockType.Code) {
          // Reconstruct markdown code block
          const language = b.language || '';
          return `\`\`\`${language}\n${b.content}\n\`\`\``;
        } else if (b.type === BlockType.List) {
          return b.content; // Already in markdown format (- item)
        } else {
          return b.content; // Plain text with markdown formatting
        }
      })
      .join('\n\n');

  const renderBlocks = () => {
    return blocks.map((block, index) => {
      const isBlockEditing = editingTextBlockIndex === index;

      if (block.type === BlockType.Code) {
        return (
          <div className="code-block-container-class-for-text-detection">
            <CodeBlock
              key={`code-${index}`}
              code={block.content}
              language={block.language}
              editable={true}
              onCodeChange={(newCode) => {
                // Update the code block in content
                blocks[index] = { ...block, content: newCode };
                const newContent = reconstructContent();
                onContentChange(newContent);
              }}
            />
          </div>
        );
      }

      if (block.type === BlockType.List)
        return (
          <FlashcardListBlock
            key={`list-edit-${index}`}
            isEditing={isBlockEditing}
            list={block}
            onEdit={(isEdit?: boolean) => {
              setEditingTextBlockIndex(isEdit === false ? null : index);
            }}
            onListUpdate={(updatedBlock) => {
              blocks[index] = updatedBlock;
              const newContent = reconstructContent();
              onContentChange(newContent);
              setEditingTextBlockIndex(null);
            }}
          />
        );

      return (
        <FlashcardTextBlock
          key={`text-${index}`}
          isEditing={isBlockEditing}
          textBlock={block}
          onEdit={(isEdit?: boolean) => {
            setEditingTextBlockIndex(isEdit === false ? null : index);
          }}
          onTextUpdate={(updatedBlock) => {
            blocks[index] = updatedBlock;
            const newContent = reconstructContent();
            onContentChange(newContent);
            setEditingTextBlockIndex(null);
          }}
        />
      );
    });
  };

  return <div className={className}>{renderBlocks()}</div>;
};
