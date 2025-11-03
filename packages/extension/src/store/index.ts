import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface SidebarState {
  isVisible: boolean;
  selectedText: string;
  context: string;
  viewMode: 'new' | 'history';
}

export interface AnalysisState {
  normalizedText: string;
}

export type PopupTab = 'new-flashcard' | 'last-flashcard';

export interface PopupState {
  position: { x: number; y: number };
  isOpen: boolean;
  activeTab: PopupTab;
}

export interface AppState {
  sidebar: SidebarState;
  analysis: AnalysisState;
  flashcardCreator: FlashcardState;
  popup: PopupState;
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
  setViewMode: (mode: 'new' | 'history') => void;
  showHistory: () => void;
  showNew: () => void;
  setNormalizedText: (text: string) => void;
  // flashcards
  addFlashcardChunk: (chunk: FlashcardChunk) => void;
  clearFlashcardChunks: () => void;
  removeFlashcardChunks: (chunksToRemove: FlashcardChunk[]) => void;
  removeFlashcardChunkByIndex: (index: number) => void;
  setPopupPosition: (position: { x: number; y: number }) => void;
  setFlashcardCreatorTitle: (title: string) => void;
  openPopup: () => void;
  closePopup: () => void;
  setActiveTab: (tab: PopupTab) => void;
}

const initialState: AppState = {
  sidebar: {
    isVisible: false,
    selectedText: '',
    context: '',
    viewMode: 'new',
  },
  analysis: {
    normalizedText: '',
  },
  flashcardCreator: {
    chunks: [],
    title: '',
  },
  popup: {
    position: { x: 0, y: 0 },
    isOpen: false,
    activeTab: 'new-flashcard',
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
        state.sidebar.viewMode = 'new';
      }),

    closeSidebar: () => set(initialState),

    setViewMode: (viewMode) =>
      set((state) => {
        state.sidebar.viewMode = viewMode;
      }),

    showHistory: () =>
      set((state) => {
        state.sidebar.viewMode = 'history';
      }),

    setNormalizedText: (text) => {
      set((state) => {
        state.analysis.normalizedText = text;
      });
    },

    showNew: () =>
      set((state) => {
        state.sidebar.viewMode = 'new';
      }),

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
     * @function openPopup
     * @description Opens the popup.
     */
    openPopup: () =>
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
  }))
);
