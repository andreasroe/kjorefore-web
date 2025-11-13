import { useState, useCallback } from 'react';
import { useRouteStore } from '@/lib/stores/route-store';
import { googleMapsService } from '@/lib/services/google-maps';
import { weatherService } from '@/lib/services/weather';
import { RouteRequest, RouteSegment } from '@/lib/types';
import { isHazardousWeather } from '@/lib/utils/weather-icons';

/**
 * Hook to orchestrate route calculation and weather fetching
 */
export function useRouteWeather() {
  const {
    route,
    loadingState,
    error,
    setRoute,
    updateSegments,
    setLoadingState,
    setError,
    clearRoute,
  } = useRouteStore();

  const [progress, setProgress] = useState(0);

  const fetchRouteWithWeather = useCallback(
    async (request: RouteRequest) => {
      try {
        // Step 1: Clear previous route
        clearRoute();
        setLoadingState('loading-route');
        setProgress(0);

        // Step 2: Calculate route
        const routeData = await googleMapsService.calculateRoute(request);
        setRoute(routeData);
        setProgress(30);

        // Step 3: Fetch location names for segments
        setLoadingState('loading-weather');
        const segmentsWithNames = await Promise.all(
          routeData.segments.map(async (segment) => {
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

        updateSegments(segmentsWithNames);
        setProgress(50);

        // Step 4: Fetch weather for each segment
        const weatherPromises = segmentsWithNames.map((segment, index) =>
          weatherService
            .getWeather(segment.location.coordinates, segment.estimatedArrivalTime)
            .then((weather) => {
              // Update progress
              setProgress(50 + Math.floor((index / segmentsWithNames.length) * 50));
              return weather;
            })
        );

        const weatherData = await Promise.all(weatherPromises);

        // Step 5: Update segments with weather and hazard detection
        const finalSegments: RouteSegment[] = segmentsWithNames.map((segment, index) => {
          const weather = weatherData[index];
          let isHazardous = false;
          let hazardType: RouteSegment['hazardType'] | undefined;

          if (weather) {
            const hazard = isHazardousWeather(
              weather.temperature,
              weather.precipitation,
              weather.windSpeed,
              segment.elevation
            );
            isHazardous = hazard.isHazardous;
            hazardType = hazard.hazardType;
          }

          return {
            ...segment,
            weather,
            isHazardous,
            hazardType,
          };
        });

        updateSegments(finalSegments);
        setProgress(100);
        setLoadingState('completed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch route';
        setError(errorMessage);
        setProgress(0);
      }
    },
    [clearRoute, setRoute, updateSegments, setLoadingState, setError]
  );

  return {
    route,
    loadingState,
    error,
    progress,
    fetchRouteWithWeather,
    clearRoute,
  };
}
