import axios from 'axios';
import {
  GoogleDirectionsResponse,
  RouteModel,
  RouteRequest,
  PlacesAutocompleteResponse,
  PlaceDetailsResponse,
  PlaceDetails,
  Location,
} from '@/lib/types';
import { decodePolyline } from '@/lib/utils/geo';
import { calculateWeatherPoints } from '@/lib/utils/route-calculator';

/**
 * Google Maps Service
 * Uses Next.js API routes as proxy to avoid CORS issues
 */
export class GoogleMapsService {
  /**
   * Calculate route from origin to destination
   */
  async calculateRoute(request: RouteRequest): Promise<RouteModel> {
    const { origin, destination, departureTime = new Date() } = request;

    try {
      const response = await axios.get<GoogleDirectionsResponse>('/api/directions', {
        params: {
          origin: `${origin.coordinates.lat},${origin.coordinates.lng}`,
          destination: `${destination.coordinates.lat},${destination.coordinates.lng}`,
          departure_time: Math.floor(departureTime.getTime() / 1000),
        },
      });

      if (response.data.status !== 'OK' || !response.data.routes.length) {
        throw new Error(`Route calculation failed: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      // Decode polyline
      const polyline = decodePolyline(route.overview_polyline.points);

      // Calculate weather sampling points
      const weatherPoints = calculateWeatherPoints(
        polyline,
        leg.duration.value,
        departureTime
      );

      const routeModel: RouteModel = {
        origin: {
          coordinates: leg.start_location,
          name: origin.name || leg.start_address,
        },
        destination: {
          coordinates: leg.end_location,
          name: destination.name || leg.end_address,
        },
        departureTime,
        polyline,
        encodedPolyline: route.overview_polyline.points,
        segments: weatherPoints.map((point) => ({
          ...point,
          weather: null, // Weather will be fetched separately
        })),
        distance: leg.distance.value,
        duration: leg.duration.value,
        bounds: {
          northeast: route.bounds.northeast,
          southwest: route.bounds.southwest,
        },
      };

      return routeModel;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Google Maps API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for places using autocomplete
   */
  async searchPlaces(query: string): Promise<PlacesAutocompleteResponse['predictions']> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await axios.get<PlacesAutocompleteResponse>(
        '/api/places/autocomplete',
        {
          params: {
            input: query,
          },
        }
      );

      if (response.data.status === 'OK') {
        return response.data.predictions;
      }

      return [];
    } catch (error) {
      console.error('Place search error:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const response = await axios.get<PlaceDetailsResponse>(
        '/api/places/details',
        {
          params: {
            place_id: placeId,
          },
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Place details fetch failed: ${response.data.status}`);
      }

      const result = response.data.result;

      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        types: result.types,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Place details error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get('/api/geocode', {
        params: {
          latlng: `${lat},${lng}`,
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }

      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  /**
   * Get current location using browser's Geolocation API
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const name = await this.reverseGeocode(coordinates.lat, coordinates.lng);

          resolve({
            coordinates,
            name,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
