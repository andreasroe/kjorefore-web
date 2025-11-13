import { Coordinates, Location } from './location';
import { WeatherData } from './weather';

/**
 * A point along a route with weather data
 */
export interface RouteSegment {
  location: Location;
  distanceFromStart: number; // meters
  estimatedArrivalTime: Date;
  weather: WeatherData | null;
  elevation?: number; // meters
  isImportant?: boolean; // Significant point to highlight
  isHazardous?: boolean; // Dangerous weather conditions
  hazardType?: 'freezing' | 'heavy_precipitation' | 'high_wind' | 'mountain';
}

/**
 * Complete route with segments
 */
export interface RouteModel {
  origin: Location;
  destination: Location;
  departureTime: Date;
  polyline: Coordinates[]; // All points along the route
  encodedPolyline?: string; // Google Maps encoded polyline
  segments: RouteSegment[]; // Weather/elevation points
  distance: number; // Total distance in meters
  duration: number; // Total duration in seconds
  bounds?: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

/**
 * Google Directions API response types
 */
export interface GoogleDirectionsResponse {
  routes: GoogleRoute[];
  status: string;
}

export interface GoogleRoute {
  legs: GoogleRouteLeg[];
  overview_polyline: {
    points: string;
  };
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface GoogleRouteLeg {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  duration_in_traffic?: {
    text: string;
    value: number; // seconds
  };
  start_address: string;
  end_address: string;
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  steps: GoogleRouteStep[];
}

export interface GoogleRouteStep {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  polyline: {
    points: string;
  };
  html_instructions: string;
  travel_mode: string;
  maneuver?: string;
}

/**
 * Route calculation request parameters
 */
export interface RouteRequest {
  origin: Location;
  destination: Location;
  departureTime?: Date;
  waypoints?: Location[];
}
