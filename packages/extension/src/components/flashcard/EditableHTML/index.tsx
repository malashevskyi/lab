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

  // Helper function to reconstruct content from blocks
  const reconstructContent = () =>
    blocks
      .map((b) => {
        if (b.type === BlockType.Code) {
          // Preserve BOTH class and data-language attributes like the server generates
          const attributes = b.language
            ? ` class="language-${b.language}" data-language="${b.language}"`
            : '';
          return `<pre><code${attributes.trim()}>${b.content}</code></pre>`;
        } else if (b.type === BlockType.List) {
          return b.content;
        } else {
          return b.content;
        }
      })
      .join('\n');

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
                const blocks = parseContentIntoBlocks(content);
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
            content={block.content}
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
          content={block.content}
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
