'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Calendar, Loader2, ArrowLeftRight } from 'lucide-react';
import { Location, PlacePrediction } from '@/lib/types';
import { googleMapsService } from '@/lib/services/google-maps';

interface RouteSearchProps {
  onSearch: (origin: Location, destination: Location, departureTime: Date) => void;
  isLoading?: boolean;
}

export function RouteSearch({ onSearch, isLoading }: RouteSearchProps) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [departureTime, setDepartureTime] = useState<Date>(new Date());

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  const [originPredictions, setOriginPredictions] = useState<PlacePrediction[]>([]);
  const [destinationPredictions, setDestinationPredictions] = useState<PlacePrediction[]>([]);

  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [gettingLocation, setGettingLocation] = useState(false);

  // Debounce timer
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

  // Handle origin input change with debounce
  const handleOriginChange = (value: string) => {
    setOriginInput(value);
    setOrigin(null);

    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => searchPlaces(value, true), 300);
    setSearchTimer(timer);
  };

  // Handle destination input change with debounce
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

  // Swap origin and destination
  const handleSwap = () => {
    const tempLocation = origin;
    const tempInput = originInput;

    setOrigin(destination);
    setOriginInput(destinationInput);

    setDestination(tempLocation);
    setDestinationInput(tempInput);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      onSearch(origin, destination, departureTime);
    }
  };

  // Set default departure time to now
  useEffect(() => {
    const now = new Date();
    // Round to nearest 5 minutes
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    now.setSeconds(0);
    setDepartureTime(now);
  }, []);

  // Format datetime for input
  const formatDatetimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Card className="p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin */}
        <div className="space-y-2 relative">
          <Label htmlFor="origin" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Fra
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                id="origin"
                value={originInput}
                onChange={(e) => handleOriginChange(e.target.value)}
                placeholder="Søk etter startsted..."
                onFocus={() => originPredictions.length > 0 && setShowOriginDropdown(true)}
              />

              {/* Origin dropdown */}
              {showOriginDropdown && originPredictions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                  {originPredictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      onClick={() => selectPlace(prediction, true)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                      <div className="text-sm text-muted-foreground">
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
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation || isLoading}
              title="Bruk min posisjon"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            disabled={isLoading}
            title="Bytt start og mål"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Destination */}
        <div className="space-y-2 relative">
          <Label htmlFor="destination" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Til
          </Label>
          <div className="relative">
            <Input
              id="destination"
              value={destinationInput}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="Søk etter destinasjon..."
              onFocus={() => destinationPredictions.length > 0 && setShowDestinationDropdown(true)}
            />

            {/* Destination dropdown */}
            {showDestinationDropdown && destinationPredictions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                {destinationPredictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    onClick={() => selectPlace(prediction, false)}
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                    <div className="text-sm text-muted-foreground">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>

        {/* Departure time */}
        <div className="space-y-2">
          <Label htmlFor="departure" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Avreise
          </Label>
          <Input
            id="departure"
            type="datetime-local"
            value={formatDatetimeLocal(departureTime)}
            onChange={(e) => setDepartureTime(new Date(e.target.value))}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!origin || !destination || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Beregner rute...
            </>
          ) : (
            'Søk rute'
          )}
        </Button>
      </form>
    </Card>
  );
}
