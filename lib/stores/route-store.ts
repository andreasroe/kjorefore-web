import { create } from 'zustand';
import { RouteModel, RouteSegment } from '@/lib/types';

/**
 * Loading states for route and weather data
 */
export type LoadingState = 'idle' | 'loading-route' | 'loading-weather' | 'completed' | 'error';

/**
 * Route store state
 */
interface RouteState {
  // Route data
  route: RouteModel | null;
  loadingState: LoadingState;
  error: string | null;

  // Actions
  setRoute: (route: RouteModel) => void;
  updateSegments: (segments: RouteSegment[]) => void;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string) => void;
  clearRoute: () => void;

  // Computed getters
  getImportantSegments: () => RouteSegment[];
  getHazardousSegments: () => RouteSegment[];
}

/**
 * Zustand store for route and weather data
 */
export const useRouteStore = create<RouteState>((set, get) => ({
  // Initial state
  route: null,
  loadingState: 'idle',
  error: null,

  // Actions
  setRoute: (route) => set({ route, loadingState: 'completed', error: null }),

  updateSegments: (segments) =>
    set((state) => ({
      route: state.route ? { ...state.route, segments } : null,
    })),

  setLoadingState: (loadingState) => set({ loadingState }),

  setError: (error) => set({ error, loadingState: 'error' }),

  clearRoute: () =>
    set({
      route: null,
      loadingState: 'idle',
      error: null,
    }),

  // Computed getters
  getImportantSegments: () => {
    const { route } = get();
    if (!route) return [];
    return route.segments.filter((segment) => segment.isImportant);
  },

  getHazardousSegments: () => {
    const { route } = get();
    if (!route) return [];
    return route.segments.filter((segment) => segment.isHazardous);
  },
}));
