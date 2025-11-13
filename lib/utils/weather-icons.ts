// Weather icons and utilities

/**
 * Map MET.no weather symbol codes to emoji icons
 */
export const WEATHER_ICONS: Record<string, string> = {
  clearsky_day: '☀️',
  clearsky_night: '🌙',
  clearsky_polartwilight: '🌅',
  fair_day: '🌤️',
  fair_night: '🌤️',
  fair_polartwilight: '🌤️',
  partlycloudy_day: '⛅',
  partlycloudy_night: '☁️',
  partlycloudy_polartwilight: '☁️',
  cloudy: '☁️',
  fog: '🌫️',
  lightrain: '🌦️',
  rain: '🌧️',
  heavyrain: '⛈️',
  lightrainshowers_day: '🌦️',
  lightrainshowers_night: '🌦️',
  lightrainshowers_polartwilight: '🌦️',
  rainshowers_day: '🌧️',
  rainshowers_night: '🌧️',
  rainshowers_polartwilight: '🌧️',
  heavyrainshowers_day: '⛈️',
  heavyrainshowers_night: '⛈️',
  heavyrainshowers_polartwilight: '⛈️',
  lightsleet: '🌨️',
  sleet: '🌨️',
  heavysleet: '🌨️',
  lightsleetshowers_day: '🌨️',
  lightsleetshowers_night: '🌨️',
  lightsleetshowers_polartwilight: '🌨️',
  sleetshowers_day: '🌨️',
  sleetshowers_night: '🌨️',
  sleetshowers_polartwilight: '🌨️',
  heavysleetshowers_day: '🌨️',
  heavysleetshowers_night: '🌨️',
  heavysleetshowers_polartwilight: '🌨️',
  lightsnow: '🌨️',
  snow: '❄️',
  heavysnow: '❄️',
  lightsnowshowers_day: '🌨️',
  lightsnowshowers_night: '🌨️',
  lightsnowshowers_polartwilight: '🌨️',
  snowshowers_day: '❄️',
  snowshowers_night: '❄️',
  snowshowers_polartwilight: '❄️',
  heavysnowshowers_day: '❄️',
  heavysnowshowers_night: '❄️',
  heavysnowshowers_polartwilight: '❄️',
  lightrainandthunder: '⛈️',
  rainandthunder: '⛈️',
  heavyrainandthunder: '⛈️',
  lightsleetandthunder: '⛈️',
  sleetandthunder: '⛈️',
  heavysleetandthunder: '⛈️',
  lightsnowandthunder: '⛈️',
  snowandthunder: '⛈️',
  heavysnowandthunder: '⛈️',
  lightrainshowersandthunder_day: '⛈️',
  lightrainshowersandthunder_night: '⛈️',
  lightrainshowersandthunder_polartwilight: '⛈️',
  rainshowersandthunder_day: '⛈️',
  rainshowersandthunder_night: '⛈️',
  rainshowersandthunder_polartwilight: '⛈️',
  heavyrainshowersandthunder_day: '⛈️',
  heavyrainshowersandthunder_night: '⛈️',
  heavyrainshowersandthunder_polartwilight: '⛈️',
  lightsleetshowersandthunder_day: '⛈️',
  lightsleetshowersandthunder_night: '⛈️',
  lightsleetshowersandthunder_polartwilight: '⛈️',
  sleetshowersandthunder_day: '⛈️',
  sleetshowersandthunder_night: '⛈️',
  sleetshowersandthunder_polartwilight: '⛈️',
  heavysleetshowersandthunder_day: '⛈️',
  heavysleetshowersandthunder_night: '⛈️',
  heavysleetshowersandthunder_polartwilight: '⛈️',
  lightsnowshowersandthunder_day: '⛈️',
  lightsnowshowersandthunder_night: '⛈️',
  lightsnowshowersandthunder_polartwilight: '⛈️',
  snowshowersandthunder_day: '⛈️',
  snowshowersandthunder_night: '⛈️',
  snowshowersandthunder_polartwilight: '⛈️',
  heavysnowshowersandthunder_day: '⛈️',
  heavysnowshowersandthunder_night: '⛈️',
  heavysnowshowersandthunder_polartwilight: '⛈️',
};

/**
 * Get weather icon for a symbol code
 */
export function getWeatherIcon(symbolCode: string): string {
  return WEATHER_ICONS[symbolCode] || '🌡️';
}

/**
 * Get color for temperature
 */
export function getTemperatureColor(temp: number): string {
  if (temp < -10) return 'text-blue-900';
  if (temp < 0) return 'text-blue-600';
  if (temp < 10) return 'text-cyan-500';
  if (temp < 20) return 'text-green-500';
  if (temp < 30) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get Norwegian weather description
 */
export function getWeatherDescription(symbolCode: string): string {
  const descriptions: Record<string, string> = {
    clearsky_day: 'Klart',
    clearsky_night: 'Klart',
    fair_day: 'Lettskyet',
    fair_night: 'Lettskyet',
    partlycloudy_day: 'Delvis skyet',
    partlycloudy_night: 'Delvis skyet',
    cloudy: 'Skyet',
    fog: 'Tåke',
    lightrain: 'Lett regn',
    rain: 'Regn',
    heavyrain: 'Kraftig regn',
    lightrainshowers_day: 'Lette regnbyger',
    lightrainshowers_night: 'Lette regnbyger',
    rainshowers_day: 'Regnbyger',
    rainshowers_night: 'Regnbyger',
    heavyrainshowers_day: 'Kraftige regnbyger',
    heavyrainshowers_night: 'Kraftige regnbyger',
    lightsleet: 'Lett sludd',
    sleet: 'Sludd',
    heavysleet: 'Kraftig sludd',
    lightsnow: 'Lett snø',
    snow: 'Snø',
    heavysnow: 'Kraftig snø',
    lightsnowshowers_day: 'Lette snøbyger',
    lightsnowshowers_night: 'Lette snøbyger',
    snowshowers_day: 'Snøbyger',
    snowshowers_night: 'Snøbyger',
    heavysnowshowers_day: 'Kraftige snøbyger',
    heavysnowshowers_night: 'Kraftige snøbyger',
    rainandthunder: 'Regn og torden',
    sleetandthunder: 'Sludd og torden',
    snowandthunder: 'Snø og torden',
  };

  return descriptions[symbolCode] || 'Ukjent';
}

/**
 * Determine if weather conditions are hazardous
 */
export function isHazardousWeather(
  temperature: number,
  precipitation: number,
  windSpeed: number,
  elevation?: number
): {
  isHazardous: boolean;
  hazardType?: 'freezing' | 'heavy_precipitation' | 'high_wind' | 'mountain';
} {
  // Freezing conditions (potential ice/slush)
  if (temperature >= -2 && temperature <= 2) {
    return { isHazardous: true, hazardType: 'freezing' };
  }

  // Heavy precipitation
  if (precipitation > 2) {
    return { isHazardous: true, hazardType: 'heavy_precipitation' };
  }

  // High elevation with wind or precipitation
  if (elevation && elevation > 500 && (windSpeed > 10 || precipitation > 0.5)) {
    return { isHazardous: true, hazardType: 'mountain' };
  }

  // High wind
  if (windSpeed > 15) {
    return { isHazardous: true, hazardType: 'high_wind' };
  }

  return { isHazardous: false };
}

/**
 * Get hazard warning message
 */
export function getHazardWarning(hazardType: string): string {
  const warnings: Record<string, string> = {
    freezing: 'Fare for glatte veier - temperaturer rundt frysepunktet',
    heavy_precipitation: 'Kraftig nedbør - redusert sikt',
    high_wind: 'Sterk vind - kjør forsiktig',
    mountain: 'Værforhold i fjellet - vær forberedt',
  };

  return warnings[hazardType] || 'Vær oppmerksom';
}
