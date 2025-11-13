import { create } from 'zustand';
import { NavigationState, Coordinates, RouteSegment } from '@/lib/types';

/**
 * Navigation store state
 */
interface NavigationStoreState extends NavigationState {
  // Actions
  startNavigation: () => void;
  stopNavigation: () => void;
  updatePosition: (
    position: Coordinates,
    speed: number,
    heading: number,
    accuracy: number
  ) => void;
  setNextWeatherPoint: (point: RouteSegment | null) => void;
  updateDistanceToNext: (distance: number, estimatedTime: number) => void;
}

/**
 * Zustand store for navigation state
 */
export const useNavigationStore = create<NavigationStoreState>((set) => ({
  // Initial state
  isActive: false,
  currentPosition: null,
  currentSpeed: 0,
  heading: 0,
  accuracy: 0,
  timestamp: 0,
  nextWeatherPoint: null,
  distanceToNext: 0,
  estimatedTimeToNext: 0,

  // Actions
  startNavigation: () =>
    set({
      isActive: true,
      currentPosition: null,
      currentSpeed: 0,
      heading: 0,
      timestamp: Date.now(),
    }),

  stopNavigation: () =>
    set({
      isActive: false,
      currentPosition: null,
      currentSpeed: 0,
      heading: 0,
      accuracy: 0,
      nextWeatherPoint: null,
      distanceToNext: 0,
      estimatedTimeToNext: 0,
    }),

  updatePosition: (position, speed, heading, accuracy) =>
    set({
      currentPosition: position,
      currentSpeed: speed,
      heading: heading,
      accuracy: accuracy,
      timestamp: Date.now(),
    }),

  setNextWeatherPoint: (point) =>
    set({
      nextWeatherPoint: point,
    }),

  updateDistanceToNext: (distance, estimatedTime) =>
    set({
      distanceToNext: distance,
      estimatedTimeToNext: estimatedTime,
    }),
}));
