import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface SidebarState {
  isVisible: boolean;
  selectedText: string;
  context: string;
}

export type PopupTab = 'new-flashcard' | 'last-flashcard' | 'analysis';

export interface PopupState {
  position: { x: number; y: number };
  isOpen: boolean;
  activeTab: PopupTab;
}

export interface AnalysisState {
  selectedText: string;
  context: string;
  normalizedText: string;
}

// save card data for regeneration
export interface LastFlashcardState {
  chunks: FlashcardChunk[];
  title: string;
  id: string | null;
}

export interface AppState {
  sidebar: SidebarState;
  flashcardCreator: FlashcardState;
  lastFlashcard: LastFlashcardState;
  popup: PopupState;
  analysis: AnalysisState;
}

/**
 * @interface FlashcardChunk
 * @description Represents a single piece of text selected by the user for flashcard creation.
 * @property {string} text - The textual content of the selection.
 * @property {Range} range - The DOM Range object representing the selection. Storing this allows us to re-apply highlights.
 */
export interface FlashcardChunk {
  text: string;
  range: Range;
}

export interface FlashcardState {
  chunks: FlashcardChunk[];
  title: string;
}

export interface AppActions {
  openSidebar: (selectedText: string, context: string) => void;
  closeSidebar: () => void;
  setNormalizedText: (text: string) => void;
  // flashcards
  addFlashcardChunk: (chunk: FlashcardChunk) => void;
  addEmptyFlashcardChunk: () => void;
  updateFlashcardChunkText: (index: number, text: string) => void;
  clearFlashcardChunks: () => void;
  removeFlashcardChunks: (chunksToRemove: FlashcardChunk[]) => void;
  removeFlashcardChunkByIndex: (index: number) => void;
  // last flashcard
  saveLastFlashcardChunks: (
    chunks: FlashcardChunk[],
    title: string,
    id: string
  ) => void;
  clearLastFlashcardChunks: () => void;
  setPopupPosition: (position: { x: number; y: number }) => void;
  setFlashcardCreatorTitle: (title: string) => void;
  handleClickExtensionIcon: () => void;
  closePopup: () => void;
  setActiveTab: (tab: PopupTab) => void;
  // Analysis actions (moved from sidebar)
  openAnalysis: (selectedText: string, context: string) => void;
}

const initialState: AppState = {
  sidebar: {
    isVisible: false,
    selectedText: '',
    context: '',
  },
  flashcardCreator: {
    chunks: [],
    title: '',
  },
  lastFlashcard: {
    chunks: [],
    title: '',
    id: null,
  },
  popup: {
    position: { x: 0, y: 0 },
    isOpen: false,
    activeTab: 'new-flashcard',
  },
  analysis: {
    selectedText: '',
    context: '',
    normalizedText: '',
  },
};

export const useAppStore = create(
  immer<AppState & AppActions>((set) => ({
    ...initialState,

    openSidebar: (selectedText, context) =>
      set((state) => {
        state.sidebar.isVisible = true;
        state.sidebar.selectedText = selectedText;
        state.sidebar.context = context;
      }),

    closeSidebar: () => set(initialState),

    setNormalizedText: (text) => {
      set((state) => {
        state.analysis.normalizedText = text;
      });
    },

    addFlashcardChunk: (chunk) =>
      set((state) => ({
        flashcardCreator: {
          chunks: [...state.flashcardCreator.chunks, chunk],
          title: state.flashcardCreator.title,
        },
        popup: {
          ...state.popup,
          isOpen: true,
          activeTab: 'new-flashcard',
        },
      })),

    addEmptyFlashcardChunk: () =>
      set((state) => {
        // Create a dummy range for the empty chunk
        const dummyRange = document.createRange();
        const emptyChunk: FlashcardChunk = {
          text: '',
          range: dummyRange,
        };

        return {
          ...state,
          flashcardCreator: {
            ...state.flashcardCreator,
            chunks: [...state.flashcardCreator.chunks, emptyChunk],
          },
        };
      }),

    updateFlashcardChunkText: (index, text) =>
      set((state) => {
        if (state.flashcardCreator.chunks[index]) {
          state.flashcardCreator.chunks[index].text = text;
        }
      }),

    clearFlashcardChunks: () =>
      set((state) => {
        state.flashcardCreator.chunks = [];
        state.flashcardCreator.title = '';
      }),

    /**
     * @function removeFlashcardChunks
     * @description Removes multiple chunks from the flashcard state.
     * @param {FlashcardChunk[]} chunksToRemove - An array of chunks to be removed.
     */
    removeFlashcardChunks: (chunksToRemove) =>
      set((state) => {
        const rangesToRemove = chunksToRemove.map((chunk) =>
          chunk.range.toString()
        );
        state.flashcardCreator.chunks = state.flashcardCreator.chunks.filter(
          (chunk) => !rangesToRemove.includes(chunk.range.toString())
        );
      }),

    /**
     * @function removeFlashcardChunkByIndex
     * @description Removes a single chunk from the flashcard state by index.
     * @param {number} index - The index of the chunk to be removed.
     */
    removeFlashcardChunkByIndex: (index) =>
      set((state) => {
        state.flashcardCreator.chunks.splice(index, 1);
      }),

    /**
     * @function saveLastFlashcardChunks
     * @description Saves flashcard chunks, title and id for potential regeneration.
     * @param {FlashcardChunk[]} chunks - The chunks to save.
     * @param {string} title - The title to save.
     * @param {string} id - The flashcard ID to save.
     */
    saveLastFlashcardChunks: (chunks, title, id) =>
      set((state) => ({
        ...state,
        lastFlashcard: {
          chunks,
          title,
          id,
        },
      })),

    /**
     * @function clearLastFlashcardChunks
     * @description Clears the saved last flashcard chunks.
     */
    clearLastFlashcardChunks: () =>
      set((state) => {
        state.lastFlashcard.chunks = [];
        state.lastFlashcard.title = '';
        state.lastFlashcard.id = null;
      }),

    /**
     * @function setPopupPosition
     * @description Updates the position of the popup.
     * @param {object} position - The new {x, y} coordinates.
     */
    setPopupPosition: (position) =>
      set((state) => {
        state.popup.position = position;
      }),

    /**
     * @function setFlashcardCreatorTitle
     * @description Updates the flashcard title.
     * @param {string} title - The new title.
     */
    setFlashcardCreatorTitle: (title) =>
      set((state) => {
        state.flashcardCreator.title = title;
      }),

    /**
     * @function handleClickExtensionIcon
     * @description Opens the popup.
     */
    handleClickExtensionIcon: () =>
      set((state) => {
        state.popup.isOpen = true;
      }),

    /**
     * @function closePopup
     * @description Closes the popup and resets flashcard state.
     */
    closePopup: () =>
      set((state) => {
        state.popup.isOpen = false;
        state.flashcardCreator.chunks = [];
        state.flashcardCreator.title = '';
      }),

    /**
     * @function setActiveTab
     * @description Sets the active tab in the popup.
     */
    setActiveTab: (tab) =>
      set((state) => {
        state.popup.activeTab = tab;
      }),

    /**
     * @function openAnalysis
     * @description Opens analysis tab in popup with selected text.
     */
    openAnalysis: (selectedText, context) =>
      set((state) => {
        state.popup.isOpen = true;
        state.popup.activeTab = 'analysis';
        state.analysis.selectedText = selectedText;
        state.analysis.context = context;
      }),
  }))
);
