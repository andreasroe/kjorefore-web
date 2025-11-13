import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json(
      { error: 'Missing place_id' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          key: GOOGLE_MAPS_API_KEY,
          language: 'no',
          fields: 'place_id,name,formatted_address,geometry,types',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Place Details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
