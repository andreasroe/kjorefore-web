'use client';

import { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Coordinates } from '@/lib/types';

interface RoutePolylineProps {
  path: Coordinates[];
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
}

export function RoutePolyline({
  path,
  strokeColor = '#2563eb',
  strokeWeight = 4,
  strokeOpacity = 0.8,
}: RoutePolylineProps) {
  const map = useMap();

  const polyline = useMemo(() => {
    if (!map) return null;

    const polyline = new google.maps.Polyline({
      path: path.map((coord) => ({ lat: coord.lat, lng: coord.lng })),
      strokeColor,
      strokeWeight,
      strokeOpacity,
      geodesic: true,
    });

    return polyline;
  }, [map, path, strokeColor, strokeWeight, strokeOpacity]);

  useEffect(() => {
    if (!polyline || !map) return;

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [polyline, map]);

  return null;
}
