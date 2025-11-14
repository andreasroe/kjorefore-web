'use client';

import { useState, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Calendar, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Location, PlacePrediction } from '@/lib/types';
import { TimeCandidate } from '@/lib/types/optimal-time';
import { googleMapsService } from '@/lib/services/google-maps';

interface OptimalTimeSearchProps {
  onSelectCandidate: (candidate: TimeCandidate) => void;
}

interface OptimalTimeSearchPropsExtended extends OptimalTimeSearchProps {
  candidates: TimeCandidate[];
  isAnalyzing: boolean;
  progress: number;
  onAnalyze: (origin: Location, destination: Location, date: Date, timeWindow: { startHour: number; endHour: number }) => void;
}

export function OptimalTimeSearch({
  isAnalyzing,
  onAnalyze
}: OptimalTimeSearchPropsExtended) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [date, setDate] = useState<Date>(addDays(new Date(), 1));
  const [timeWindow, setTimeWindow] = useState({ startHour: 6, endHour: 18 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  const [originPredictions, setOriginPredictions] = useState<PlacePrediction[]>([]);
  const [destinationPredictions, setDestinationPredictions] = useState<PlacePrediction[]>([]);

  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Search for places
  const searchPlaces = useCallback(async (query: string, isOrigin: boolean) => {
    if (query.length < 2) {
      if (isOrigin) setOriginPredictions([]);
      else setDestinationPredictions([]);
      return;
    }

    try {
      const predictions = await googleMapsService.searchPlaces(query);
      if (isOrigin) {
        setOriginPredictions(predictions);
        setShowOriginDropdown(true);
      } else {
        setDestinationPredictions(predictions);
        setShowDestinationDropdown(true);
      }
    } catch (error) {
      console.error('Place search error:', error);
    }
  }, []);

  // Handle origin input change
  const handleOriginChange = (value: string) => {
    setOriginInput(value);
    setOrigin(null);

    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => searchPlaces(value, true), 300);
    setSearchTimer(timer);
  };

  // Handle destination input change
  const handleDestinationChange = (value: string) => {
    setDestinationInput(value);
    setDestination(null);

    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => searchPlaces(value, false), 300);
    setSearchTimer(timer);
  };

  // Select a place from predictions
  const selectPlace = async (prediction: PlacePrediction, isOrigin: boolean) => {
    try {
      const placeDetails = await googleMapsService.getPlaceDetails(prediction.place_id);
      const location: Location = {
        coordinates: placeDetails.coordinates,
        name: placeDetails.formattedAddress,
        placeId: placeDetails.placeId,
      };

      if (isOrigin) {
        setOrigin(location);
        setOriginInput(placeDetails.formattedAddress);
        setShowOriginDropdown(false);
      } else {
        setDestination(location);
        setDestinationInput(placeDetails.formattedAddress);
        setShowDestinationDropdown(false);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  // Get current location
  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await googleMapsService.getCurrentLocation();
      setOrigin(location);
      setOriginInput(location.name || 'Min posisjon');
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Kunne ikke hente din posisjon. Sjekk at du har gitt tilgang til posisjon.');
    } finally {
      setGettingLocation(false);
    }
  };

  // Analyze optimal times
  const handleAnalyze = () => {
    if (!origin || !destination) return;
    onAnalyze(origin, destination, date, timeWindow);
    setIsCollapsed(true);
  };

  // Format date for input
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Card className="p-3">
      {isCollapsed ? (
        // Collapsed view
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">
              <span className="font-medium">{originInput}</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="font-medium">{destinationInput}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(date, 'd. MMM', { locale: nb })} • {String(timeWindow.startHour).padStart(2, '0')}:00-{String(timeWindow.endHour).padStart(2, '0')}:00
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            title="Vis søkedetaljer"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Origin */}
          <div className="relative">
            <div className="flex gap-1.5 items-center">
              <Label htmlFor="optimal-origin" className="text-sm flex items-center gap-1.5 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" />
                Fra
              </Label>
              <div className="flex-1 relative">
                <Input
                  id="optimal-origin"
                  value={originInput}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  placeholder="Startsted..."
                  className="h-9 text-sm"
                  onFocus={() => originPredictions.length > 0 && setShowOriginDropdown(true)}
                />

                {showOriginDropdown && originPredictions.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                    {originPredictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        type="button"
                        onClick={() => selectPlace(prediction, true)}
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                      >
                        <div className="font-medium text-sm">{prediction.structured_formatting.main_text}</div>
                        <div className="text-xs text-muted-foreground">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      </button>
                    ))}
                  </Card>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation || isAnalyzing}
                title="Bruk min posisjon"
              >
                {gettingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="flex gap-1.5 items-center">
              <Label htmlFor="optimal-destination" className="text-sm flex items-center gap-1.5 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" />
                Til
              </Label>
              <Input
                id="optimal-destination"
                value={destinationInput}
                onChange={(e) => handleDestinationChange(e.target.value)}
                placeholder="Destinasjon..."
                className="h-9 text-sm flex-1"
                onFocus={() => destinationPredictions.length > 0 && setShowDestinationDropdown(true)}
              />

              {showDestinationDropdown && destinationPredictions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                  {destinationPredictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      onClick={() => selectPlace(prediction, false)}
                      className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                    >
                      <div className="font-medium text-sm">{prediction.structured_formatting.main_text}</div>
                      <div className="text-xs text-muted-foreground">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </button>
                  ))}
                </Card>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-1.5 items-center">
            <Label htmlFor="optimal-date" className="text-sm flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
              Dato
            </Label>
            <Input
              id="optimal-date"
              type="date"
              className="h-9 text-sm flex-1"
              value={formatDateForInput(date)}
              onChange={(e) => setDate(new Date(e.target.value))}
              min={formatDateForInput(new Date())}
            />
          </div>

          {/* Time window - dual handle range slider */}
          <div className="pt-2 border-t">
            <Label className="text-xs font-medium mb-2 block">Tidsvindu</Label>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold">{String(timeWindow.startHour).padStart(2, '0')}:00</span>
                <span className="text-muted-foreground">til</span>
                <span className="font-semibold">{String(timeWindow.endHour).padStart(2, '0')}:00</span>
              </div>

              <div className="relative h-8 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-lg" />

                {/* Active range */}
                <div
                  className="absolute h-1.5 bg-primary rounded-lg"
                  style={{
                    left: `${(timeWindow.startHour / 23) * 100}%`,
                    right: `${((23 - timeWindow.endHour) / 23) * 100}%`
                  }}
                />

                {/* Start handle */}
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={timeWindow.startHour}
                  onChange={(e) => {
                    const newStart = parseInt(e.target.value);
                    if (newStart < timeWindow.endHour) {
                      setTimeWindow({ ...timeWindow, startHour: newStart });
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow"
                  style={{ zIndex: timeWindow.startHour > timeWindow.endHour - 2 ? 5 : 3 }}
                />

                {/* End handle */}
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={timeWindow.endHour}
                  onChange={(e) => {
                    const newEnd = parseInt(e.target.value);
                    if (newEnd > timeWindow.startHour) {
                      setTimeWindow({ ...timeWindow, endHour: newEnd });
                    }
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow"
                  style={{ zIndex: 4 }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {timeWindow.endHour - timeWindow.startHour + 1} tidspunkter analyseres
              </p>
            </div>
          </div>

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            className="w-full h-9"
            disabled={!origin || !destination || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Analyserer...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Finn beste tidspunkt
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
