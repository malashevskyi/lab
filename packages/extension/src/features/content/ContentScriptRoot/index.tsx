import React, { useEffect } from 'react';
import { usePrevious } from 'react-use';
import { Sidebar } from '../../../components/Layout/Sidebar';
import { useAppStore } from '../../../store';
import { getWordOrPhraseContextForSelection } from './utils/getWordOrPhraseContextForSelection';
import { expandSelectionToFullWords } from './utils/expandSelectionToFullWords';
import { captureError } from '../../../utils/sentry';
import { doRangesIntersect } from '../../../utils/doRangesIntersect';
import { expandSelectionAcrossNodes } from './utils/expandSelectionAcrossNodes';
import { MainPopup } from '../../../components/ui/MainPopup';

const SIDEBAR_OPEN_BODY_CLASS = 'deepread-sidebar-open';

window.addEventListener('error', (event) => {
  captureError(event.error, {
    type: 'window.error',
    message: event.message,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  captureError(event.reason, {
    type: 'unhandledRejection',
  });
});

const highlightApiSupported = CSS.highlights !== undefined;

if (highlightApiSupported) {
  CSS.highlights.set('deepread-highlight', new Highlight());
  CSS.highlights.set('deepread-flashcard-chunks-highlight', new Highlight());
}

const FLASHCARD_CREATOR_HEIGHT = 150;
const POPUP_OFFSET = 10;

const ContentScriptRoot: React.FC = () => {
  const isSidebarVisible = useAppStore((state) => state.sidebar.isVisible);
  const openSidebar = useAppStore((state) => state.openSidebar);
  const addFlashcardChunk = useAppStore((state) => state.addFlashcardChunk);
  const flashcardCreatorChunks = useAppStore(
    (state) => state.flashcardCreator.chunks
  );
  const removeFlashcardChunks = useAppStore(
    (state) => state.removeFlashcardChunks
  );
  const setPopupPosition = useAppStore((state) => state.setPopupPosition);
  const prevChunksCount = usePrevious(flashcardCreatorChunks.length);

  const selectedTextFromStore = useAppStore(
    (state) => state.sidebar.selectedText
  );
  const [currentRange, setCurrentRange] = React.useState<Range | null>(null);

  useEffect(() => {
    if (selectedTextFromStore) {
      document.body.classList.add(SIDEBAR_OPEN_BODY_CLASS);
    } else {
      document.body.classList.remove(SIDEBAR_OPEN_BODY_CLASS);
    }
  }, [selectedTextFromStore]);

  /**
   * @function handleMouseUp
   * @description Handles the mouseup event to trigger different functionalities
   * based on the modifier key pressed (`Alt` for analysis, `Shift` for flashcard chunking).
   */
  const handleMouseUp = (event: MouseEvent) => {
    if (!event.altKey && !event.shiftKey) return;

    event.preventDefault();

    if (event.target instanceof HTMLElement === false) return;
    // ignore if clicked inside the sidebar
    if (event.target.closest('#deepread-root')) return;

    let selection = window.getSelection();

    if (!selection) return;

    const range = selection.getRangeAt(0);
    if (
      range.startContainer.nodeType !== Node.TEXT_NODE ||
      range.endContainer.nodeType !== Node.TEXT_NODE
    ) {
      console.warn('[DeepRead] Ignored non-text selection.');
      selection.removeAllRanges();
      return;
    }

    // add flashcard chunk with, multiple selection support
    if (event.metaKey && event.altKey) {
      selection = expandSelectionAcrossNodes(selection);

      const newRange = selection.getRangeAt(0).cloneRange();
      const newText = selection.toString().trim();

      const intersectingChunks = flashcardCreatorChunks.filter((chunk) => {
        return doRangesIntersect(chunk.range, newRange);
      });

      let parentElement = newRange.commonAncestorContainer;
      if (parentElement.nodeType === Node.TEXT_NODE) {
        parentElement = parentElement.parentNode!;
      }

      if (intersectingChunks.length) {
        removeFlashcardChunks(intersectingChunks);
      } else if (newText) {
        addFlashcardChunk({ text: newText, range: newRange });
      }
      selection.removeAllRanges();
    }

    // analyze text with Alt key
    if (!event.metaKey && event.altKey) {
      selection = expandSelectionToFullWords(selection);

      setCurrentRange(selection.getRangeAt(0).cloneRange());

      const selectedText = selection.toString().trim();

      const context = getWordOrPhraseContextForSelection(selection);

      if (context && selectedText) {
        openSidebar(selectedText, context);
      }

      return true;
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    if (!highlightApiSupported) return;

    const highlight = CSS.highlights.get('deepread-highlight');

    if (!highlight) return;

    highlight.clear();

    if (isSidebarVisible && currentRange) {
      highlight.add(currentRange);
    }
  }, [isSidebarVisible, currentRange]);

  useEffect(() => {
    if (!highlightApiSupported) return;
    const flashcardHighlight = CSS.highlights.get(
      'deepread-flashcard-chunks-highlight'
    );
    if (!flashcardHighlight) return;

    flashcardHighlight.clear();
    if (flashcardCreatorChunks.length > 0) {
      flashcardCreatorChunks.forEach((chunk) =>
        flashcardHighlight.add(chunk.range)
      );
    }
  }, [flashcardCreatorChunks]);

  /**
   * We need to position the flashcard creator popup above the first chunk when it's added.
   */
  useEffect(() => {
    if (flashcardCreatorChunks.length > 0 && prevChunksCount === 0) {
      const firstChunkRange = flashcardCreatorChunks[0].range;
      const rect = firstChunkRange.getBoundingClientRect();

      const newPosition = {
        // x: rect.left + window.scrollX,
        x: 0,
        y: rect.top + window.scrollY - FLASHCARD_CREATOR_HEIGHT - POPUP_OFFSET,
      };

      setPopupPosition(newPosition);
    }
  }, [flashcardCreatorChunks, prevChunksCount, setPopupPosition]);

  return (
    <>
      <MainPopup />
      {isSidebarVisible && <Sidebar />}
    </>
  );
};

export default ContentScriptRoot;
