import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureTime = searchParams.get('departure_time');

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Missing origin or destination' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination,
          mode: 'driving',
          departure_time: departureTime || Math.floor(Date.now() / 1000),
          key: GOOGLE_MAPS_API_KEY,
          language: 'no',
          region: 'no',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directions' },
      { status: 500 }
    );
  }
}
