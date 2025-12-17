import React, { useEffect } from "react";
import { usePrevious } from "react-use";

import { ExplainSelection } from "../../../components/explain/ExplainSelection";
import { MainPopup } from "../../../components/popup/MainPopup";
import { useAppStore } from "../../../store";
import { doRangesIntersect } from "../../../utils/doRangesIntersect";
import { HIGHLIGHT_KEYS } from "../../../constants/highlights";
import { expandSelectionAcrossNodes } from "./utils/expandSelectionAcrossNodes";
import { expandSelectionToFullWords } from "./utils/expandSelectionToFullWords";
import { getWordOrPhraseContextForSelection } from "./utils/getWordOrPhraseContextForSelection";
import { fromUnknown, notifyAndCapture } from "../../../services/errorUtils";
import { toast } from "sonner";
import { MessageType } from "../../../types/sentry-messages";

window.addEventListener("error", (event) => {
  fromUnknown(event.error, {
    context: "window.error",
    clientMessage: event.message,
  });
});

// ! it lead to infinite loop in some cases on some ai chat pages while chat responding
// window.addEventListener("unhandledrejection", (event) => {
//   fromUnknown(event.reason, {
//     clientMessage: `${event.reason}`,
//     context: "unhandledRejection",
//   });
// });

const highlightApiSupported = CSS.highlights !== undefined;

if (highlightApiSupported) {
  CSS.highlights.set(HIGHLIGHT_KEYS.SELECTED_TEXT, new Highlight());
  CSS.highlights.set(HIGHLIGHT_KEYS.FLASHCARD_CHUNKS, new Highlight());
}

const FLASHCARD_CREATOR_HEIGHT = 150;
const POPUP_OFFSET = 10;

const ContentScriptRoot: React.FC = () => {
  const openAnalysis = useAppStore((state) => state.openAnalysis);
  const addFlashcardChunk = useAppStore((state) => state.addFlashcardChunk);
  const flashcardCreatorChunks = useAppStore(
    (state) => state.flashcardCreator.chunks
  );
  const removeFlashcardChunks = useAppStore(
    (state) => state.removeFlashcardChunks
  );
  const setPopupPosition = useAppStore((state) => state.setPopupPosition);
  const handleClickExtensionIcon = useAppStore(
    (state) => state.handleClickExtensionIcon
  );
  const prevChunksCount = usePrevious(flashcardCreatorChunks.length);
  const selectedTextFromStore = useAppStore(
    (state) => state.analysis.selectedText
  );
  const [currentRange, setCurrentRange] = React.useState<Range | null>(null);
  const [isContentScriptReady, setIsContentScriptReady] = React.useState(false);

  /**
   * @function handleMouseUp
   * @description Handles the mouseup event to trigger different functionalities
   * based on the modifier key pressed (`Alt` for analysis, `Shift` for flashcard chunking).
   */
  const handleMouseUp = (event: MouseEvent) => {
    if (!event.altKey && !event.shiftKey) return;

    // Ensure content script is ready before processing selection
    if (!isContentScriptReady) {
      toast.warning(
        "Extension is still loading, please try again in a moment."
      );
      return;
    }

    event.preventDefault();

    if (event.target instanceof HTMLElement === false) return;
    // ignore if clicked inside the sidebar
    if (event.target.closest("#assistant-root")) return;

    let selection = window.getSelection();

    if (!selection) return;

    const range = selection.getRangeAt(0);
    if (
      range.startContainer.nodeType !== Node.TEXT_NODE ||
      range.endContainer.nodeType !== Node.TEXT_NODE
    ) {
      notifyAndCapture("Non-text selection detected", {
        nodeType: range.startContainer.nodeType,
      });
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
        openAnalysis(selectedText, context);
      }

      return true;
    }
  };

  // Mark content script as ready after initial render
  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setIsContentScriptReady(true);
    }, 1000);

    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    console.log("Content script ready state:");
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  // Handle messages from background script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === MessageType.OPEN_POPUP) {
        handleClickExtensionIcon();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [handleClickExtensionIcon]);

  // Highlight selected text for analysis
  useEffect(() => {
    if (!highlightApiSupported) return;

    const selectedTextHighlight = CSS.highlights.get(
      HIGHLIGHT_KEYS.SELECTED_TEXT
    );
    if (!selectedTextHighlight) return;

    selectedTextHighlight.clear();

    if (currentRange && selectedTextFromStore) {
      selectedTextHighlight.add(currentRange);
    }
  }, [currentRange, selectedTextFromStore]);

  // Clear highlighting when analysis tab is closed
  useEffect(() => {
    if (!selectedTextFromStore && highlightApiSupported) {
      const selectedTextHighlight = CSS.highlights.get(
        HIGHLIGHT_KEYS.SELECTED_TEXT
      );
      if (selectedTextHighlight) {
        selectedTextHighlight.clear();
      }
      setCurrentRange(null);
    }
  }, [selectedTextFromStore]);

  useEffect(() => {
    if (!highlightApiSupported) return;
    const flashcardHighlight = CSS.highlights.get(
      HIGHLIGHT_KEYS.FLASHCARD_CHUNKS
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
    <div id="assistant-root">
      <MainPopup />
      <ExplainSelection />
    </div>
  );
};

export default ContentScriptRoot;
