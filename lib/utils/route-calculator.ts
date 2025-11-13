import { Coordinates, RouteSegment } from '@/lib/types';
import { calculateDistance } from './geo';

/**
 * Calculate weather sampling points along a route
 * Returns evenly distributed points based on route duration
 */
export function calculateWeatherPoints(
  polyline: Coordinates[],
  totalDurationSeconds: number,
  departureTime: Date
): Omit<RouteSegment, 'weather'>[] {
  if (polyline.length === 0) return [];

  // Sample every 30 minutes
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  const numPoints = Math.max(2, Math.ceil((totalDurationSeconds * 1000) / INTERVAL_MS));

  const points: Omit<RouteSegment, 'weather'>[] = [];
  let accumulatedDistance = 0;

  for (let i = 0; i < numPoints; i++) {
    const fraction = i / (numPoints - 1);
    const index = Math.floor(fraction * (polyline.length - 1));
    const time = new Date(departureTime.getTime() + i * INTERVAL_MS);

    // Calculate distance from start to this point
    if (i > 0 && points.length > 0) {
      const prevPoint = polyline[Math.floor(((i - 1) / (numPoints - 1)) * (polyline.length - 1))];
      accumulatedDistance += calculateDistance(prevPoint, polyline[index]);
    }

    points.push({
      location: {
        coordinates: polyline[index],
      },
      distanceFromStart: accumulatedDistance,
      estimatedArrivalTime: time,
      isImportant: i === 0 || i === numPoints - 1 || i % 2 === 0,
    });
  }

  return points;
}

/**
 * Calculate total route distance from polyline
 */
export function calculateRouteDistance(polyline: Coordinates[]): number {
  let totalDistance = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    totalDistance += calculateDistance(polyline[i], polyline[i + 1]);
  }

  return totalDistance;
}

/**
 * Split route into segments based on distance intervals
 */
export function splitRouteByDistance(
  polyline: Coordinates[],
  intervalMeters: number
): Coordinates[] {
  if (polyline.length === 0) return [];

  const segments: Coordinates[] = [polyline[0]];
  let accumulatedDistance = 0;
  let lastSegmentDistance = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const segmentDistance = calculateDistance(polyline[i], polyline[i + 1]);
    accumulatedDistance += segmentDistance;

    if (accumulatedDistance - lastSegmentDistance >= intervalMeters) {
      segments.push(polyline[i + 1]);
      lastSegmentDistance = accumulatedDistance;
    }
  }

  // Always include the last point
  if (segments[segments.length - 1] !== polyline[polyline.length - 1]) {
    segments.push(polyline[polyline.length - 1]);
  }

  return segments;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}t ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Calculate ETA based on current position and remaining distance
 */
export function calculateETA(
  distanceRemaining: number,
  currentSpeed: number
): Date | null {
  if (currentSpeed <= 0) return null;

  // Convert speed from km/h to m/s
  const speedMs = (currentSpeed * 1000) / 3600;
  const secondsRemaining = distanceRemaining / speedMs;

  return new Date(Date.now() + secondsRemaining * 1000);
}
