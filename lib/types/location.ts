/**
 * Geographic coordinate
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Location with coordinates and optional name
 */
export interface Location {
  coordinates: Coordinates;
  name?: string;
  placeId?: string; // Google Places ID
}

/**
 * Geographic bounds for a region
 */
export interface Bounds {
  northeast: Coordinates;
  southwest: Coordinates;
}
