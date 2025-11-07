import TextareaAutosize from 'react-textarea-autosize';
import DOMPurify from 'dompurify';
import { normalizeContentForComparison } from '../EditableHTML/utils/normalizeContentForComparison';
import {
  BlockType,
  type Block,
} from '../EditableHTML/utils/parseContentIntoBlocks';
import { markdownToHtml } from '../EditableHTML/utils/markdownToHtml';

interface FlashcardTextBlockProps {
  isEditing: boolean;
  textBlock: Block;
  onEdit: (isEdit?: boolean) => void;
  onTextUpdate: (updatedBlock: Block) => void;
}

export const FlashcardTextBlock: React.FC<FlashcardTextBlockProps> = ({
  isEditing,
  textBlock,
  onEdit,
  onTextUpdate,
}) => {
  const compareAndHandleUpdate = (markdownText: string) => {
    if (
      normalizeContentForComparison(textBlock.content) ===
      normalizeContentForComparison(markdownText)
    ) {
      onEdit(false);
      return;
    }

    onTextUpdate({ type: BlockType.Text, content: markdownText });
  };

  if (isEditing) {
    return (
      <TextareaAutosize
        className="w-full p-2 border border-solid border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        defaultValue={textBlock.content}
        autoFocus
        onBlur={(e) => compareAndHandleUpdate(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' && e.shiftKey) || e.key === 'Escape') {
            e.preventDefault();

            // handle update and unfocus
            if (e.target instanceof HTMLTextAreaElement) {
              compareAndHandleUpdate(e.target.value);
            }
          }
          // other keys are ignored, allowing normal textarea behavior
        }}
        minRows={1}
        placeholder="Type your content... Use **bold**, *italic*, _underline_, `code`"
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-gray-50 p-1 rounded mb-2"
      onClick={() => onEdit()}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(markdownToHtml(textBlock.content)),
      }}
    />
  );
};
