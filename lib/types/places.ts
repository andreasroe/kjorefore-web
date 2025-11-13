import { Coordinates } from './location';

/**
 * Google Places Autocomplete prediction
 */
export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    main_text_matched_substrings: { length: number; offset: number }[];
    secondary_text: string;
  };
  types: string[];
}

/**
 * Google Places Autocomplete response
 */
export interface PlacesAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

/**
 * Place details from Google Places API
 */
export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: Coordinates;
  types: string[];
}

/**
 * Google Place Details response
 */
export interface PlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
  };
  status: string;
}
