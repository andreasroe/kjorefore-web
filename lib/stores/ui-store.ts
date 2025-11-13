import { create } from 'zustand';

/**
 * View modes for the main interface
 */
export type ViewMode = 'map' | 'timeline' | 'graph';

/**
 * UI state store
 */
interface UIState {
  // Current view mode
  viewMode: ViewMode;

  // Mobile drawer state
  isDrawerOpen: boolean;

  // Selected weather point (for details)
  selectedSegmentIndex: number | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  selectSegment: (index: number | null) => void;
}

/**
 * Zustand store for UI state
 */
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  viewMode: 'map',
  isDrawerOpen: false,
  selectedSegmentIndex: null,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  selectSegment: (index) => set({ selectedSegmentIndex: index }),
}));
