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

export interface FlashcardCreatorState {
  position: { x: number; y: number };
  title: string;
  isPopupOpen: boolean;
}

export interface AppState {
  sidebar: SidebarState;
  analysis: AnalysisState;
  flashcard: FlashcardState;
  flashcardCreator: FlashcardCreatorState;
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
  setFlashcardCreatorPosition: (position: { x: number; y: number }) => void;
  setFlashcardCreatorTitle: (title: string) => void;
  openFlashcardPopup: () => void;
  closeFlashcardPopup: () => void;
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
  flashcard: {
    chunks: [],
  },
  flashcardCreator: {
    position: { x: 0, y: 0 },
    title: '',
    isPopupOpen: false,
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
        flashcard: {
          chunks: [...state.flashcard.chunks, chunk],
        },
        flashcardCreator: {
          ...state.flashcardCreator,
          // Автоматично відкриваємо попап при додаванні першого чанку
          isPopupOpen: true,
        },
      })),

    clearFlashcardChunks: () =>
      set((state) => {
        state.flashcard.chunks = [];
        // НЕ закриваємо попап і НЕ скидаємо позицію
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
        state.flashcard.chunks = state.flashcard.chunks.filter(
          (chunk) => !rangesToRemove.includes(chunk.range.toString())
        );
      }),

    /**
     * @function setFlashcardCreatorPosition
     * @description Updates the position of the flashcard creator popup.
     * @param {object} position - The new {x, y} coordinates.
     */
    setFlashcardCreatorPosition: (position) =>
      set((state) => {
        state.flashcardCreator.position = position;
      }),

    /**
     * @function setFlashcardCreatorTitle
     * @description Updates the title for the flashcard creator.
     * @param {string} title - The new title.
     */
    setFlashcardCreatorTitle: (title) =>
      set((state) => {
        state.flashcardCreator.title = title;
      }),

    /**
     * @function openFlashcardPopup
     * @description Opens the flashcard creator popup.
     */
    openFlashcardPopup: () =>
      set((state) => {
        state.flashcardCreator.isPopupOpen = true;
      }),

    /**
     * @function closeFlashcardPopup
     * @description Closes the flashcard creator popup and resets its state.
     */
    closeFlashcardPopup: () =>
      set((state) => {
        state.flashcardCreator.isPopupOpen = false;
        state.flashcard.chunks = [];
        // НЕ скидаємо позицію, щоб попап з'явився в тому ж місці при наступному відкритті
      }),
  }))
);
