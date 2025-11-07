import { create } from 'zustand';

interface ToolbarState {
  isToolbarVisible: boolean;
  setToolbarVisible: (visible: boolean) => void;
}

export const useToolbarStore = create<ToolbarState>((set) => ({
  isToolbarVisible: false,
  setToolbarVisible: (visible: boolean) => set({ isToolbarVisible: visible }),
}));
