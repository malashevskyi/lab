import TextareaAutosize from 'react-textarea-autosize';
import DOMPurify from 'dompurify';
import { normalizeContentForComparison } from '../EditableHTML/utils/normalizeContentForComparison';
import {
  BlockType,
  type Block,
} from '../EditableHTML/utils/parseContentIntoBlocks';
import { renderListAsHtml } from './renderListAsHtml';
import { useToolbarStore } from '../../../store/toolbarStore';

interface FlashcardListBlockProps {
  isEditing: boolean;
  list: Block;
  onEdit: (isEdit?: boolean) => void;
  onListUpdate: (updatedBlock: Block) => void;
}

export const FlashcardListBlock: React.FC<FlashcardListBlockProps> = ({
  isEditing,
  list,
  onEdit,
  onListUpdate,
}) => {
  const setToolbarVisible = useToolbarStore((state) => state.setToolbarVisible);

  const compareAndHandleUpdate = (markdownList: string) => {
    if (
      normalizeContentForComparison(list.content) ===
      normalizeContentForComparison(markdownList)
    ) {
      onEdit(false);
      return;
    }

    onListUpdate({ type: BlockType.List, content: markdownList });
  };

  if (isEditing) {
    return (
      <TextareaAutosize
        className="w-full p-2 border border-solid border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        defaultValue={list.content}
        autoFocus
        onFocus={() => setToolbarVisible(true)}
        onBlur={(e) => {
          setToolbarVisible(false);
          compareAndHandleUpdate(e.target.value);
        }}
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
        __html: DOMPurify.sanitize(renderListAsHtml(list.content)),
      }}
    />
  );
};
