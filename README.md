# Kjørefore Web

Weather-aware route planner for road trips in Norway. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Route Planning**: Search for origin and destination with Google Places autocomplete
- **Weather Along Route**: See weather conditions at multiple points along your driving route
- **Three View Modes**:
  - **Map View**: Interactive map with weather markers
  - **Timeline View**: Chronological list of weather forecasts
  - **Graph View**: Charts showing temperature, precipitation, and wind
- **Navigation Mode**: Real-time GPS tracking with automatic map rotation
- **Hazard Detection**: Automatic warnings for dangerous weather conditions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Maps**: @vis.gl/react-google-maps
- **Charts**: Recharts
- **Data Fetching**: React Query + Axios
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Directions API
  - Places API
  - Geocoding API

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

3. Add your Google Maps API key and contact information:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_YR_CONTACT_EMAIL=your_email@example.com
NEXT_PUBLIC_APP_NAME=Kjorefore
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
kjorefore-web/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── map/               # Map-related components
│   ├── timeline/          # Timeline view components
│   ├── graph/             # Graph view components
│   ├── search/            # Search and input components
│   ├── navigation/        # Navigation mode components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── services/          # API services (Google Maps, MET.no)
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── public/                # Static assets
```

## API Integrations

### Google Maps

This app uses Google Maps APIs for:
- Route calculation (Directions API)
- Place search and autocomplete (Places API)
- Reverse geocoding (Geocoding API)
- Map display (Maps JavaScript API via @vis.gl/react-google-maps)

### MET.no Weather API

Weather data is provided by the Norwegian Meteorological Institute (MET.no):
- Free to use, no API key required
- Must include User-Agent header with contact info
- Data cached for 30 minutes to respect rate limits
- Forecasts available up to 10 days ahead

## Key Features Implementation

### Route Planning
- Uses Google Maps Directions API for route calculation
- Divides route into segments (every 30 minutes of travel)
- Fetches weather data for each segment from MET.no
- Displays route on interactive map with weather markers

### Weather Visualization
- **Map View**: Custom markers showing weather icons and temperature
- **Timeline View**: Vertical timeline with detailed weather info
- **Graph View**: Line charts for temperature and precipitation trends

### Navigation Mode
- Real-time GPS tracking using browser Geolocation API
- Automatic map rotation based on heading
- Map snapping to route (50m tolerance)
- Live speed and ETA calculations
- Next weather point display with countdown

### Hazard Detection
- Identifies dangerous conditions:
  - Freezing temperatures (-2°C to 2°C)
  - Heavy precipitation (>2mm)
  - High winds (>15 m/s)
  - Mountain conditions (elevation >500m with weather)
- Visual warnings on map and timeline
- Norwegian language descriptions

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `NEXT_PUBLIC_YR_CONTACT_EMAIL` | Contact email for MET.no User-Agent | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `NEXT_PUBLIC_APP_VERSION` | Application version | No |

## License

Private project - All rights reserved

## Acknowledgments

- Weather data from [MET Norway](https://api.met.no/)
- Maps and routing from [Google Maps Platform](https://developers.google.com/maps)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
