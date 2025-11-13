import { GeolocationPosition, GeolocationOptions, Coordinates } from '@/lib/types';

/**
 * Geolocation Service
 * Handles browser geolocation API for navigation mode
 */
export class GeolocationService {
  private watchId: number | null = null;
  private lastPosition: Coordinates | null = null;
  private lastHeading: number = 0;

  /**
   * Get current position
   */
  async getCurrentPosition(
    options?: GeolocationOptions
  ): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(this.normalizePosition(position));
        },
        (error) => {
          reject(this.normalizeError(error));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 0,
        }
      );
    });
  }

  /**
   * Watch position with continuous updates
   */
  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: Error) => void,
    options?: GeolocationOptions
  ): number {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const normalized = this.normalizePosition(position);

        // Calculate heading from position changes if not provided
        if (normalized.coords.heading === null && this.lastPosition) {
          normalized.coords.heading = this.calculateHeading(
            this.lastPosition,
            { lat: normalized.coords.latitude, lng: normalized.coords.longitude }
          );
        }

        this.lastPosition = {
          lat: normalized.coords.latitude,
          lng: normalized.coords.longitude,
        };

        if (normalized.coords.heading !== null) {
          this.lastHeading = normalized.coords.heading;
        }

        callback(normalized);
      },
      (error) => {
        if (errorCallback) {
          errorCallback(this.normalizeError(error));
        }
      },
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 1000,
      }
    );

    return this.watchId;
  }

  /**
   * Stop watching position
   */
  clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request geolocation permission
   */
  async requestPermission(): Promise<PermissionState> {
    if (!('permissions' in navigator)) {
      // Fallback for browsers without Permissions API
      try {
        await this.getCurrentPosition();
        return 'granted';
      } catch {
        return 'denied';
      }
    }

    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  }

  /**
   * Normalize browser position to our type
   */
  private normalizePosition(position: globalThis.GeolocationPosition): GeolocationPosition {
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      },
      timestamp: position.timestamp,
    };
  }

  /**
   * Normalize geolocation error
   */
  private normalizeError(error: GeolocationPositionError): Error {
    const messages: Record<number, string> = {
      1: 'Location permission denied',
      2: 'Location position unavailable',
      3: 'Location request timeout',
    };

    return new Error(messages[error.code] || 'Unknown geolocation error');
  }

  /**
   * Calculate heading between two points (fallback if GPS doesn't provide heading)
   */
  private calculateHeading(from: Coordinates, to: Coordinates): number {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    return bearing;
  }

  /**
   * Get last known heading
   */
  getLastHeading(): number {
    return this.lastHeading;
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
