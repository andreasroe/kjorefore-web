import { Coordinates } from './location';
import { RouteSegment } from './route';

/**
 * Navigation state for real-time tracking
 */
export interface NavigationState {
  isActive: boolean;
  currentPosition: Coordinates | null;
  currentSpeed: number; // km/h
  heading: number; // degrees (0-360, where 0 is north)
  accuracy: number; // meters
  timestamp: number; // Unix timestamp
  nextWeatherPoint: RouteSegment | null;
  distanceToNext: number; // meters to next weather point
  estimatedTimeToNext: number; // seconds to next weather point
}

/**
 * GPS position data from browser Geolocation API
 */
export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
    altitude: number | null; // meters
    altitudeAccuracy: number | null; // meters
    heading: number | null; // degrees
    speed: number | null; // m/s
  };
  timestamp: number; // Unix timestamp
}

/**
 * Options for watching position
 */
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number; // milliseconds
  maximumAge?: number; // milliseconds
}

/**
 * Map camera position for navigation
 */
export interface CameraPosition {
  center: Coordinates;
  zoom: number;
  heading: number; // degrees
  tilt: number; // degrees
}
