import React, { useEffect } from 'react';
import { Sidebar } from '../../../components/Layout/Sidebar';
import { useAppStore } from '../../../store';
import { getWordOrPhraseContextForSelection } from './utils/getWordOrPhraseContextForSelection';
import { expandSelectionToFullWords } from './utils/expandSelectionToFullWords';
import { captureError } from '../../../utils/sentry';

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

const ContentScriptRoot: React.FC = () => {
  const isSidebarVisible = useAppStore((state) => state.sidebar.isVisible);
  const openSidebar = useAppStore((state) => state.openSidebar);
  const addFlashcardChunk = useAppStore((state) => state.addFlashcardChunk);
  const flashcardChunks = useAppStore((state) => state.flashcard.chunks);

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
    console.log('🚀 ~ event:', event);
    if (!event.altKey && !event.shiftKey) return;

    event.preventDefault();

    if (event.target instanceof HTMLElement === false) return;
    // ignore if clicked inside the sidebar
    if (event.target.closest('#deepread-root')) return;

    let selection = window.getSelection();

    if (!selection) return;

    // analyze text with Alt key
    if (event.altKey) {
      selection = expandSelectionToFullWords(selection);

      setCurrentRange(selection.getRangeAt(0).cloneRange());

      const selectedText = selection.toString().trim();

      const context = getWordOrPhraseContextForSelection(selection);

      if (context && selectedText) {
        openSidebar(selectedText, context);
      }

      return true;
    }

    // add flashcard chunk with Shift key
    if (event.shiftKey) {
      selection = expandSelectionToFullWords(selection);

      const range = selection.getRangeAt(0).cloneRange();
      const text = selection.toString().trim();

      if (text) {
        addFlashcardChunk({ text, range });
      }
      selection.removeAllRanges();
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
    if (flashcardChunks.length > 0) {
      flashcardChunks.forEach((chunk) => flashcardHighlight.add(chunk.range));
    }
  }, [flashcardChunks]);

  if (!isSidebarVisible) return null;

  return (
    <>
      <Sidebar />
    </>
  );
};

export default ContentScriptRoot;
