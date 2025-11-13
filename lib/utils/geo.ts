import { Coordinates } from '@/lib/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate bearing from point1 to point2
 * @returns bearing in degrees (0-360, where 0 is north)
 */
export function calculateBearing(point1: Coordinates, point2: Coordinates): number {
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  return bearing;
}

/**
 * Snap GPS position to the nearest point on the route
 * @param currentPos Current GPS position
 * @param routePolyline Route polyline points
 * @param tolerance Maximum distance in meters to snap (default 50m)
 * @returns Snapped position or original position if too far from route
 */
export function snapToRoute(
  currentPos: Coordinates,
  routePolyline: Coordinates[],
  tolerance: number = 50
): Coordinates {
  let closestPoint: Coordinates | null = null;
  let minDistance = Infinity;

  for (const point of routePolyline) {
    const distance = calculateDistance(currentPos, point);
    if (distance < minDistance && distance < tolerance) {
      minDistance = distance;
      closestPoint = point;
    }
  }

  return closestPoint || currentPos;
}

/**
 * Decode Google Maps encoded polyline to coordinates
 * @param encoded Encoded polyline string
 * @returns Array of coordinates
 */
export function decodePolyline(encoded: string): Coordinates[] {
  const coordinates: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return coordinates;
}

/**
 * Find the closest point on the route to a given position
 * @returns Index and distance to closest point
 */
export function findClosestPointOnRoute(
  position: Coordinates,
  route: Coordinates[]
): { index: number; distance: number } {
  let minDistance = Infinity;
  let closestIndex = 0;

  route.forEach((point, index) => {
    const distance = calculateDistance(position, point);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return { index: closestIndex, distance: minDistance };
}

/**
 * Interpolate position along route based on distance traveled
 */
export function interpolatePosition(
  route: Coordinates[],
  distanceFromStart: number
): Coordinates | null {
  if (route.length === 0) return null;
  if (distanceFromStart <= 0) return route[0];

  let accumulatedDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const segmentDistance = calculateDistance(route[i], route[i + 1]);

    if (accumulatedDistance + segmentDistance >= distanceFromStart) {
      // Interpolate between route[i] and route[i + 1]
      const fraction = (distanceFromStart - accumulatedDistance) / segmentDistance;

      return {
        lat: route[i].lat + (route[i + 1].lat - route[i].lat) * fraction,
        lng: route[i].lng + (route[i + 1].lng - route[i].lng) * fraction,
      };
    }

    accumulatedDistance += segmentDistance;
  }

  return route[route.length - 1];
}
