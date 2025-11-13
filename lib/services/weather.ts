import axios from 'axios';
import { WeatherData, MetNoResponse, Coordinates } from '@/lib/types';
import { isHazardousWeather } from '@/lib/utils/weather-icons';

const MET_NO_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// User-Agent header is required by MET.no
const USER_AGENT = `${process.env.NEXT_PUBLIC_APP_NAME || 'Kjorefore'}/${
  process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
} (${process.env.NEXT_PUBLIC_YR_CONTACT_EMAIL || 'contact@kjorefore.no'})`;

/**
 * Cache entry for weather data
 */
interface WeatherCacheEntry {
  data: MetNoResponse;
  timestamp: number;
  expiresAt: number;
}

/**
 * MET.no Weather Service
 * Fetches weather data from the Norwegian Meteorological Institute
 */
export class WeatherService {
  private cache: Map<string, WeatherCacheEntry> = new Map();
  private baseUrl = MET_NO_BASE_URL;

  /**
   * Generate cache key for coordinates and time
   */
  private getCacheKey(lat: number, lng: number, time?: Date): string {
    const roundedLat = lat.toFixed(2);
    const roundedLng = lng.toFixed(2);
    const timeKey = time ? Math.floor(time.getTime() / (60 * 60 * 1000)) : 'current';
    return `${roundedLat},${roundedLng},${timeKey}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(entry: WeatherCacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Fetch weather forecast from MET.no API
   */
  private async fetchWeatherForecast(
    lat: number,
    lng: number
  ): Promise<MetNoResponse> {
    try {
      const response = await axios.get<MetNoResponse>(`${this.baseUrl}/compact`, {
        params: {
          lat: lat.toFixed(4),
          lon: lng.toFixed(4),
        },
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('MET.no API error:', error.message);
        throw new Error(`Weather API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Find the closest weather data point to a specific time
   */
  private findClosestTimeseriesEntry(
    timeseries: MetNoResponse['properties']['timeseries'],
    targetTime: Date
  ): MetNoResponse['properties']['timeseries'][0] | null {
    if (!timeseries.length) return null;

    let closestEntry = timeseries[0];
    let minDiff = Math.abs(new Date(timeseries[0].time).getTime() - targetTime.getTime());

    for (const entry of timeseries) {
      const diff = Math.abs(new Date(entry.time).getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestEntry = entry;
      }
    }

    return closestEntry;
  }

  /**
   * Parse MET.no timeseries entry to WeatherData
   */
  private parseWeatherData(
    entry: MetNoResponse['properties']['timeseries'][0]
  ): WeatherData {
    const instant = entry.data.instant.details;
    const next = entry.data.next_1_hours || entry.data.next_6_hours;

    return {
      temperature: instant.air_temperature,
      precipitation: next?.details.precipitation_amount || 0,
      windSpeed: instant.wind_speed,
      windDirection: instant.wind_from_direction,
      weatherDescription: next?.summary.symbol_code || 'unknown',
      weatherCode: next?.summary.symbol_code || 'unknown',
      humidity: instant.relative_humidity,
      cloudiness: instant.cloud_area_fraction,
      pressure: instant.air_pressure_at_sea_level,
    };
  }

  /**
   * Get weather for a specific location and time
   */
  async getWeather(
    coordinates: Coordinates,
    time?: Date
  ): Promise<WeatherData | null> {
    const { lat, lng } = coordinates;
    const targetTime = time || new Date();
    const cacheKey = this.getCacheKey(lat, lng, targetTime);

    try {
      // Check cache first
      const cachedEntry = this.cache.get(cacheKey);
      let forecast: MetNoResponse;

      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        forecast = cachedEntry.data;
      } else {
        // Fetch fresh data
        forecast = await this.fetchWeatherForecast(lat, lng);

        // Cache the response
        this.cache.set(cacheKey, {
          data: forecast,
          timestamp: Date.now(),
          expiresAt: Date.now() + CACHE_DURATION_MS,
        });
      }

      // Find closest timeseries entry to target time
      const closestEntry = this.findClosestTimeseriesEntry(
        forecast.properties.timeseries,
        targetTime
      );

      if (!closestEntry) {
        return null;
      }

      return this.parseWeatherData(closestEntry);
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  /**
   * Get weather for multiple locations (batch request with rate limiting)
   */
  async getWeatherForMultipleLocations(
    locations: Array<{ coordinates: Coordinates; time: Date }>
  ): Promise<(WeatherData | null)[]> {
    const results: (WeatherData | null)[] = [];

    // Process locations sequentially to respect rate limits
    // MET.no recommends waiting between requests
    for (const location of locations) {
      const weather = await this.getWeather(location.coordinates, location.time);
      results.push(weather);

      // Small delay between requests (100ms) to be respectful
      if (locations.indexOf(location) < locations.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get weather with hazard detection
   */
  async getWeatherWithHazards(
    coordinates: Coordinates,
    time?: Date,
    elevation?: number
  ): Promise<WeatherData & { isHazardous: boolean; hazardType?: string } | null> {
    const weather = await this.getWeather(coordinates, time);

    if (!weather) return null;

    const hazard = isHazardousWeather(
      weather.temperature,
      weather.precipitation,
      weather.windSpeed,
      elevation
    );

    return {
      ...weather,
      isHazardous: hazard.isHazardous,
      hazardType: hazard.hazardType,
    };
  }

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries from cache
   */
  cleanCache(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

// Clean cache periodically (every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    weatherService.cleanCache();
  }, 10 * 60 * 1000);
}
