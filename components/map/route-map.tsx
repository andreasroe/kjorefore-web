'use client';

import { useEffect } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { RouteModel } from '@/lib/types';
import { RoutePolyline } from './route-polyline';
import { WeatherMarkers } from './weather-markers';

interface RouteMapProps {
  route: RouteModel | null;
  className?: string;
}

const DEFAULT_CENTER = { lat: 59.9139, lng: 10.7522 }; // Oslo
const DEFAULT_ZOOM = 7;

export function RouteMap({ route, className }: RouteMapProps) {
  const map = useMap();

  // Fit map bounds to route when route changes
  useEffect(() => {
    if (map && route?.bounds) {
      const bounds = new google.maps.LatLngBounds(
        route.bounds.southwest,
        route.bounds.northeast
      );
      map.fitBounds(bounds, {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      });
    }
  }, [map, route]);

  return (
    <div className={className}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {route && (
          <>
            <RoutePolyline path={route.polyline} />
            <WeatherMarkers segments={route.segments} />
          </>
        )}
      </Map>
    </div>
  );
}
