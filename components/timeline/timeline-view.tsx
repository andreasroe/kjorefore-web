'use client';

import { RouteSegment } from '@/lib/types';
import {
  Droplets,
  Wind,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { getWeatherIcon, getTemperatureColor } from '@/lib/utils/weather-icons';

interface TimelineViewProps {
  segments: RouteSegment[];
}

export function TimelineView({ segments }: TimelineViewProps) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0">
      {segments.map((segment, index) => (
        <TimelineItem
          key={index}
          segment={segment}
          isFirst={index === 0}
          isLast={index === segments.length - 1}
        />
      ))}
    </div>
  );
}

interface TimelineItemProps {
  segment: RouteSegment;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineItem({ segment, isFirst, isLast }: TimelineItemProps) {
  const { weather, estimatedArrivalTime, location, isHazardous } = segment;

  // Determine dot color based on hazard level
  const dotColor = isHazardous
    ? 'bg-red-500 border-red-600'
    : segment.isImportant
    ? 'bg-orange-500 border-orange-600'
    : 'bg-blue-500 border-blue-600';

  const bgColor = isHazardous ? 'bg-red-50' : '';

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line and dot */}
      <div className="relative flex flex-col items-center">
        {/* Line above (hidden for first item) */}
        {!isFirst && <div className="w-0.5 h-3 bg-gray-300" />}

        {/* Dot */}
        <div className={`w-3 h-3 rounded-full border-2 ${dotColor} flex-shrink-0 z-10`} />

        {/* Line below (hidden for last item) */}
        {!isLast && <div className="w-0.5 flex-1 bg-gray-300" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${bgColor} ${bgColor ? 'p-2 rounded-lg -ml-2' : ''}`}>
        {/* Time */}
        <div className="font-semibold text-sm">
          {format(estimatedArrivalTime, 'HH:mm', { locale: nb })}
        </div>

        {/* Location */}
        {location.name && (
          <div className="flex items-start gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{location.name}</span>
          </div>
        )}

        {/* Weather info */}
        {weather && (
          <div className="mt-2 space-y-1">
            {/* Temperature and weather */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{getWeatherIcon(weather.weatherCode)}</span>
              <span className={`font-semibold ${getTemperatureColor(weather.temperature)}`}>
                {Math.round(weather.temperature)}°C
              </span>
              <span className="text-xs text-muted-foreground">
                {weather.weatherDescription}
              </span>
            </div>

            {/* Precipitation and wind */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {weather.precipitation > 0 && (
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.precipitation.toFixed(1)}mm</span>
                </div>
              )}
              {weather.windSpeed > 0 && (
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.windSpeed.toFixed(1)} m/s</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hazard warning */}
        {isHazardous && segment.hazardType && (
          <div className="flex items-center gap-1 mt-2 text-xs text-red-700">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-medium">{getHazardTitle(segment.hazardType)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getHazardTitle(hazardType: string): string {
  const titles: Record<string, string> = {
    freezing: 'Fare for glatte veier',
    heavy_precipitation: 'Kraftig nedbør',
    high_wind: 'Sterk vind',
    mountain: 'Værforhold i fjellet',
  };
  return titles[hazardType] || 'Advarsel';
}
