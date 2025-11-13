import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get('input');

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input,
          key: GOOGLE_MAPS_API_KEY,
          language: 'no',
          components: 'country:no',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Places Autocomplete error:', error);
    return NextResponse.json({ predictions: [] });
  }
}
