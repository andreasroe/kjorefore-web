import { Location, RouteModel } from './index';

/**
 * Time candidate for optimal departure time analysis
 */
export interface TimeCandidate {
  departureTime: Date;
  score: number;
  weatherSummary: WeatherSummary;
  hazardCount: number;
  route: RouteModel;
}

/**
 * Weather summary for a route
 */
export interface WeatherSummary {
  avgPrecipitation: number;
  maxPrecipitation: number;
  maxWindSpeed: number;
  minTemperature: number;
  maxTemperature: number;
  hasSnow: boolean;
  hasFreezingTemp: boolean;
}

/**
 * Request for finding optimal departure time
 */
export interface OptimalTimeRequest {
  origin: Location;
  destination: Location;
  date: Date;
  timeWindow: {
    startHour: number;
    endHour: number;
  };
  interval?: number; // Minutes between tests (default 60)
}

/**
 * Weather scoring weights
 */
export interface WeatherScoreWeights {
  precipitation: number;
  wind: number;
  freezingTemp: number;
  hazard: number;
}
