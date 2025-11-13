'use client';

import { Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { RouteSegment } from '@/lib/types';
import { getWeatherIcon, getTemperatureColor } from '@/lib/utils/weather-icons';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WeatherMarkersProps {
  segments: RouteSegment[];
}

export function WeatherMarkers({ segments }: WeatherMarkersProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.weather) return null;

        return (
          <WeatherMarker
            key={index}
            segment={segment}
            isSelected={selectedSegment === index}
            onSelect={() => setSelectedSegment(index)}
            onClose={() => setSelectedSegment(null)}
          />
        );
      })}
    </>
  );
}

interface WeatherMarkerProps {
  segment: RouteSegment;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

function WeatherMarker({ segment, isSelected, onSelect, onClose }: WeatherMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  if (!segment.weather) return null;

  const { weather, location, estimatedArrivalTime, isHazardous } = segment;
  const icon = getWeatherIcon(weather.weatherCode);

  // Create custom label for marker
  const label = {
    text: `${icon} ${Math.round(weather.temperature)}°`,
    color: isHazardous ? '#991b1b' : '#1f2937',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  return (
    <>
      <Marker
        position={location.coordinates}
        onClick={onSelect}
        title={location.name}
        label={label}
        ref={(ref) => setMarker(ref)}
      />

      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={onClose}>
          <Card className="p-3 min-w-[250px] border-0 shadow-none">
            <div className="space-y-2">
              {/* Location and time */}
              <div>
                <div className="font-semibold text-sm">{location.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(estimatedArrivalTime, 'HH:mm', { locale: nb })}
                </div>
              </div>

              {/* Hazard warning */}
              {isHazardous && segment.hazardType && (
                <Badge variant="destructive" className="w-full justify-center">
                  {getHazardLabel(segment.hazardType)}
                </Badge>
              )}

              {/* Weather info */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Temperatur:</span>
                  <span className={`font-semibold ${getTemperatureColor(weather.temperature)}`}>
                    {Math.round(weather.temperature)}°C
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nedbør:</span>
                  <span>{weather.precipitation.toFixed(1)} mm</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vind:</span>
                  <span>{weather.windSpeed.toFixed(1)} m/s</span>
                </div>

                {weather.humidity !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Luftfuktighet:</span>
                    <span>{Math.round(weather.humidity)}%</span>
                  </div>
                )}
              </div>

              {/* Weather description */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {weather.weatherDescription}
              </div>
            </div>
          </Card>
        </InfoWindow>
      )}
    </>
  );
}

function getHazardLabel(hazardType: string): string {
  const labels: Record<string, string> = {
    freezing: '⚠️ Glatte veier',
    heavy_precipitation: '⚠️ Kraftig nedbør',
    high_wind: '⚠️ Sterk vind',
    mountain: '⚠️ Værforhold i fjellet',
  };
  return labels[hazardType] || '⚠️ Fare';
}
