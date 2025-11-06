import TextareaAutosize from 'react-textarea-autosize';
import DOMPurify from 'dompurify';
import { normalizeContentForComparison } from '../EditableHTML/utils/normalizeContentForComparison';
import {
  BlockType,
  type Block,
} from '../EditableHTML/utils/parseContentIntoBlocks';
import { markdownToHtml } from '../EditableHTML/utils/markdownToHTML';
import { htmlToMarkdown } from '../EditableHTML/utils/htmlToMarkdown';

interface FlashcardListBlockProps {
  isEditing: boolean;
  content: string;
  list: Block;
  onEdit: (isEdit?: boolean) => void;
  onListUpdate: (updatedBlock: Block) => void;
}

export const FlashcardListBlock: React.FC<FlashcardListBlockProps> = ({
  isEditing,
  content,
  list,
  onEdit,
  onListUpdate,
}) => {
  const compareAndHandleUpdate = (rowList: string) => {
    // Convert markdown list back to HTML for comparison
    const newHtml = rowList
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const content = line.replace(/^-\s*/, '').trim();
        const htmlContent = markdownToHtml(content);
        return `<li>${htmlContent}</li>`;
      })
      .join('');
    const newListHtml = `<ul>${newHtml}</ul>`;

    // If content hasn't changed, don't update
    if (
      normalizeContentForComparison(list.content) ===
      normalizeContentForComparison(newListHtml)
    ) {
      onEdit(false);
      return;
    }

    onListUpdate({ type: BlockType.List, content: newListHtml });
  };

  if (isEditing) {
    // Convert list to markdown for editing
    // First extract each li content and convert to markdown
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const listItems = tempDiv.querySelectorAll('li');
    const markdownItems = Array.from(listItems).map((li) => {
      const htmlContent = li.innerHTML;
      const markdownContent = htmlToMarkdown(htmlContent);
      return `- ${markdownContent}`;
    });
    const listMarkdown = markdownItems.join('\n');

    return (
      <TextareaAutosize
        className="w-full p-2 border border-solid border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        defaultValue={listMarkdown.trim()}
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
        minRows={2}
        placeholder="Type list items... Use - for each item"
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-gray-50 p-1 rounded mb-2"
      onClick={() => onEdit()}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content),
      }}
    />
  );
};
