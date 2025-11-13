import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latlng = searchParams.get('latlng');

  if (!latlng) {
    return NextResponse.json(
      { error: 'Missing latlng parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng,
          key: GOOGLE_MAPS_API_KEY,
          language: 'no',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode' },
      { status: 500 }
    );
  }
}
