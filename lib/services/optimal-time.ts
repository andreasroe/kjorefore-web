import { setHours, setMinutes } from 'date-fns';
import { googleMapsService } from './google-maps';
import { weatherService } from './weather';
import { RouteSegment } from '@/lib/types';
import {
  OptimalTimeRequest,
  TimeCandidate,
  WeatherSummary,
  WeatherScoreWeights,
} from '@/lib/types/optimal-time';

/**
 * Default scoring weights
 */
const DEFAULT_WEIGHTS: WeatherScoreWeights = {
  precipitation: 3,
  wind: 2,
  freezingTemp: 10,
  hazard: 20,
};

/**
 * Service for finding optimal departure times
 */
export class OptimalTimeService {
  private weights: WeatherScoreWeights;

  constructor(weights: WeatherScoreWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Find optimal departure times within a time window
   */
  async findOptimalDepartureTime(
    request: OptimalTimeRequest,
    onProgress?: (progress: number) => void
  ): Promise<TimeCandidate[]> {
    const { origin, destination, date, timeWindow, interval = 60 } = request;

    // Generate time candidates
    const timesToTest = this.generateTimeSlots(date, timeWindow, interval);
    const totalSteps = timesToTest.length;
    const candidates: TimeCandidate[] = [];

    for (let i = 0; i < timesToTest.length; i++) {
      const departureTime = timesToTest[i];

      try {
        // Calculate route for this departure time
        const route = await googleMapsService.calculateRoute({
          origin,
          destination,
          departureTime,
        });

        // Fetch location names
        const segmentsWithNames = await Promise.all(
          route.segments.map(async (segment) => {
            const name = await googleMapsService.reverseGeocode(
              segment.location.coordinates.lat,
              segment.location.coordinates.lng
            );
            return {
              ...segment,
              location: {
                ...segment.location,
                name,
              },
            };
          })
        );

        route.segments = segmentsWithNames;

        // Fetch weather for all segments with batching
        const weatherData = await this.fetchWeatherInBatches(segmentsWithNames);

        // Update segments with weather
        const finalSegments = segmentsWithNames.map((segment, index) => ({
          ...segment,
          weather: weatherData[index],
        }));

        route.segments = finalSegments;

        // Calculate score and summary
        const score = this.calculateWeatherScore(finalSegments);
        const weatherSummary = this.summarizeWeather(finalSegments);
        const hazardCount = this.countHazards(finalSegments);

        candidates.push({
          departureTime,
          score,
          weatherSummary,
          hazardCount,
          route,
        });

        // Report progress
        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalSteps) * 100));
        }
      } catch (error) {
        console.error(`Error analyzing time ${departureTime}:`, error);
        // Continue with next time slot
      }
    }

    // Sort by score (highest first)
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate time slots to test
   */
  private generateTimeSlots(
    date: Date,
    timeWindow: { startHour: number; endHour: number },
    intervalMinutes: number
  ): Date[] {
    const slots: Date[] = [];
    const { startHour, endHour } = timeWindow;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 0) break;

        let slotTime = setHours(date, hour);
        slotTime = setMinutes(slotTime, minute);
        slots.push(slotTime);
      }
    }

    return slots;
  }

  /**
   * Fetch weather data in batches to respect rate limits
   */
  private async fetchWeatherInBatches(
    segments: RouteSegment[]
  ): Promise<(RouteSegment['weather'] | null)[]> {
    const BATCH_SIZE = 10;
    const results: (RouteSegment['weather'] | null)[] = [];

    for (let i = 0; i < segments.length; i += BATCH_SIZE) {
      const batch = segments.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((segment) =>
          weatherService.getWeather(
            segment.location.coordinates,
            segment.estimatedArrivalTime
          )
        )
      );
      results.push(...batchResults);

      // Delay between batches
      if (i + BATCH_SIZE < segments.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return results;
  }

  /**
   * Calculate weather score for a route
   * Higher score = better conditions
   */
  private calculateWeatherScore(segments: RouteSegment[]): number {
    let score = 100; // Perfect score

    segments.forEach((segment) => {
      const w = segment.weather;
      if (!w) return;

      // Heavy precipitation penalty
      if (w.precipitation > 2) {
        const penalty = Math.min(10, w.precipitation * this.weights.precipitation);
        score -= penalty;
      }

      // Strong wind penalty
      if (w.windSpeed > 15) {
        const penalty = Math.min(15, (w.windSpeed - 15) * this.weights.wind);
        score -= penalty;
      }

      // Hazardous conditions penalty
      if (segment.isHazardous) {
        score -= this.weights.hazard;
      }
    });

    return Math.max(0, Math.round(score));
  }

  /**
   * Summarize weather conditions for a route
   */
  private summarizeWeather(segments: RouteSegment[]): WeatherSummary {
    let totalPrecipitation = 0;
    let maxPrecipitation = 0;
    let maxWindSpeed = 0;
    let minTemperature = Infinity;
    let maxTemperature = -Infinity;
    let hasSnow = false;
    let hasFreezingTemp = false;
    let validSegments = 0;

    segments.forEach((segment) => {
      const w = segment.weather;
      if (!w) return;

      validSegments++;
      totalPrecipitation += w.precipitation;
      maxPrecipitation = Math.max(maxPrecipitation, w.precipitation);
      maxWindSpeed = Math.max(maxWindSpeed, w.windSpeed);
      minTemperature = Math.min(minTemperature, w.temperature);
      maxTemperature = Math.max(maxTemperature, w.temperature);

      if (w.temperature < 2 && w.precipitation > 0) {
        hasSnow = true;
      }

      if (w.temperature >= -2 && w.temperature <= 2) {
        hasFreezingTemp = true;
      }
    });

    return {
      avgPrecipitation:
        validSegments > 0 ? Math.round((totalPrecipitation / validSegments) * 10) / 10 : 0,
      maxPrecipitation: Math.round(maxPrecipitation * 10) / 10,
      maxWindSpeed: Math.round(maxWindSpeed * 10) / 10,
      minTemperature: Math.round(minTemperature * 10) / 10,
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      hasSnow,
      hasFreezingTemp,
    };
  }

  /**
   * Count hazardous segments
   */
  private countHazards(segments: RouteSegment[]): number {
    return segments.filter((s) => s.isHazardous).length;
  }
}

// Export singleton instance
export const optimalTimeService = new OptimalTimeService();
