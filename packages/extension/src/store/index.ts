import { create } from 'zustand';

export interface SidebarState {
  isVisible: boolean;
  selectedText: string;
  context: string;
  viewMode: 'new' | 'history';
}

export interface AnalysisState {
  normalizedText: string;
}

export interface AppState {
  sidebar: SidebarState;
  analysis: AnalysisState;
  flashcard: FlashcardState;
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
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  openSidebar: (selectedText, context) =>
    set(() => ({
      sidebar: {
        isVisible: true,
        selectedText,
        context,
        viewMode: 'new',
      },
    })),

  closeSidebar: () => set(initialState),

  setViewMode: (viewMode) =>
    set((state) => ({
      sidebar: { ...state.sidebar, viewMode },
    })),

  showHistory: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, viewMode: 'history' },
    })),

  setNormalizedText: (text) => {
    set((state) => ({
      analysis: { ...state.analysis, normalizedText: text },
    }));
  },

  showNew: () =>
    set((state) => ({
      sidebar: { ...state.sidebar, viewMode: 'new' },
    })),

  addFlashcardChunk: (chunk) =>
    set((state) => ({
      flashcard: {
        chunks: [...state.flashcard.chunks, chunk],
      },
    })),

  clearFlashcardChunks: () =>
    set((state) => ({
      flashcard: { ...state.flashcard, chunks: [] },
    })),
}));
