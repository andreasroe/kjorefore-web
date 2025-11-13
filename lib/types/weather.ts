/**
 * Weather data from MET.no API
 */
export interface WeatherData {
  temperature: number; // Celsius
  precipitation: number; // mm per hour
  windSpeed: number; // m/s
  windDirection?: number; // degrees
  weatherDescription: string;
  weatherCode: string; // MET.no symbol code (e.g., 'clearsky_day', 'rain', etc.)
  humidity?: number; // percentage
  cloudiness?: number; // percentage (cloud area fraction)
  pressure?: number; // hPa
}

/**
 * Raw weather response from MET.no API
 */
export interface MetNoResponse {
  properties: {
    meta: {
      updated_at: string;
      units: {
        air_temperature: string;
        precipitation_amount: string;
        wind_speed: string;
      };
    };
    timeseries: MetNoTimeseries[];
  };
}

export interface MetNoTimeseries {
  time: string; // ISO 8601 timestamp
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        wind_from_direction?: number;
        relative_humidity?: number;
        cloud_area_fraction?: number;
        air_pressure_at_sea_level?: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
    next_6_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
  };
}

/**
 * Weather icon mapping for MET.no symbol codes
 */
export type WeatherSymbolCode =
  | 'clearsky_day'
  | 'clearsky_night'
  | 'cloudy'
  | 'fair_day'
  | 'fair_night'
  | 'partlycloudy_day'
  | 'partlycloudy_night'
  | 'fog'
  | 'rain'
  | 'lightrain'
  | 'heavyrain'
  | 'rainshowers_day'
  | 'rainshowers_night'
  | 'sleet'
  | 'snow'
  | 'snowshowers_day'
  | 'snowshowers_night'
  | 'lightrainshowers_day'
  | 'lightrainshowers_night'
  | 'heavyrainshowers_day'
  | 'heavyrainshowers_night'
  | 'lightssleetshowers_day'
  | 'lightssleetshowers_night'
  | 'heavysleetshowers_day'
  | 'heavysleetshowers_night'
  | 'lightsnowshowers_day'
  | 'lightsnowshowers_night'
  | 'heavysnowshowers_day'
  | 'heavysnowshowers_night'
  | 'rainandthunder'
  | 'sleetandthunder'
  | 'snowandthunder'
  | 'lightrainandthunder'
  | 'heavyrainandthunder'
  | 'lightsleetandthunder'
  | 'heavysleetandthunder'
  | 'lightsnowandthunder'
  | 'heavysnowandthunder';
