import { create } from 'zustand';
import type { GetLastFlashcardResponseType } from '@lab/types/assistant/flashcards';

interface FlashcardState {
  flashcards: Map<string, GetLastFlashcardResponseType>;
  setFlashcards: (flashcards: GetLastFlashcardResponseType[]) => void;
  addFlashcard: (flashcard: GetLastFlashcardResponseType) => void;
  updateFlashcard: (
    id: string,
    flashcard: GetLastFlashcardResponseType
  ) => void;
  clearFlashcards: () => void;
}

export const useFlashcardStore = create<FlashcardState>((set) => ({
  flashcards: new Map(),
  setFlashcards: (flashcards) =>
    set(() => ({
      flashcards: new Map(
        flashcards
          .filter((card) => card !== null)
          .map((card) => [card.id, card])
      ),
    })),
  addFlashcard: (flashcard) =>
    set((state) => {
      if (flashcard === null) return state;
      const newFlashcards = new Map(state.flashcards);
      newFlashcards.set(flashcard.id, flashcard);
      return { flashcards: newFlashcards };
    }),
  updateFlashcard: (id, flashcard) =>
    set((state) => {
      const newFlashcards = new Map(state.flashcards);
      newFlashcards.set(id, flashcard);
      return { flashcards: newFlashcards };
    }),
  clearFlashcards: () => set({ flashcards: new Map() }),
}));
