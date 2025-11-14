'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { RouteSearch } from '@/components/search/route-search';
import { OptimalTimeSearch } from '@/components/optimal-time/optimal-time-search';
import { TimeCandidates } from '@/components/optimal-time/time-candidates';
import { RouteMap } from '@/components/map/route-map';
import { TimelineView } from '@/components/timeline/timeline-view';
import { useRouteWeather } from '@/lib/hooks/use-route-weather';
import { optimalTimeService } from '@/lib/services/optimal-time';
import { Location } from '@/lib/types';
import { TimeCandidate } from '@/lib/types/optimal-time';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudRain, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/utils/route-calculator';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export default function Home() {
  const { route, loadingState, error, progress, fetchRouteWithWeather } = useRouteWeather();
  const [optimalCandidates, setOptimalCandidates] = useState<TimeCandidate[]>([]);
  const [isAnalyzingOptimal, setIsAnalyzingOptimal] = useState(false);
  const [optimalProgress, setOptimalProgress] = useState(0);

  const handleSearch = (origin: Location, destination: Location, departureTime: Date) => {
    fetchRouteWithWeather({ origin, destination, departureTime });
  };

  const handleAnalyzeOptimal = async (
    origin: Location,
    destination: Location,
    date: Date,
    timeWindow: { startHour: number; endHour: number }
  ) => {
    setIsAnalyzingOptimal(true);
    setOptimalProgress(0);
    setOptimalCandidates([]);

    try {
      const results = await optimalTimeService.findOptimalDepartureTime(
        { origin, destination, date, timeWindow },
        (p) => setOptimalProgress(p)
      );
      setOptimalCandidates(results);
    } catch (error) {
      console.error('Error analyzing optimal times:', error);
      alert('Kunne ikke analysere optimalt tidspunkt. Prøv igjen.');
    } finally {
      setIsAnalyzingOptimal(false);
      setOptimalProgress(0);
    }
  };

  const handleSelectCandidate = (candidate: TimeCandidate) => {
    // Use the route from the selected candidate
    fetchRouteWithWeather({
      origin: candidate.route.origin,
      destination: candidate.route.destination,
      departureTime: candidate.departureTime,
    });
  };

  const hazardousSegments = route?.segments.filter((s) => s.isHazardous) || [];
  const isLoading = loadingState === 'loading-route' || loadingState === 'loading-weather';

  return (
    <div className="h-screen flex flex-col">
      <Header />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-gray-50 border-r flex flex-col overflow-hidden">
          {/* Search form with tabs */}
          <div className="p-4">
            <Tabs defaultValue="route" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="route">Søk rute</TabsTrigger>
                <TabsTrigger value="optimal">Finn beste tid</TabsTrigger>
              </TabsList>

              <TabsContent value="route" className="mt-0">
                <RouteSearch onSearch={handleSearch} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="optimal" className="mt-0">
                <OptimalTimeSearch
                  onSelectCandidate={handleSelectCandidate}
                  candidates={optimalCandidates}
                  isAnalyzing={isAnalyzingOptimal}
                  progress={optimalProgress}
                  onAnalyze={handleAnalyzeOptimal}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Loading progress */}
          {isLoading && (
            <div className="px-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {loadingState === 'loading-route' ? 'Beregner rute...' : 'Henter værdata...'}
                    </span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Optimal time analysis progress */}
          {isAnalyzingOptimal && (
            <div className="px-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyserer tidspunkter...</span>
                    <span className="font-semibold">{optimalProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${optimalProgress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="px-4">
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-2 text-red-900">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Feil</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Optimal time results */}
          {optimalCandidates.length > 0 && !isAnalyzingOptimal && (
            <div className="flex-1 overflow-y-auto p-4">
              <TimeCandidates candidates={optimalCandidates} onSelect={handleSelectCandidate} />
            </div>
          )}

          {/* Route info */}
          {route && !isLoading && !isAnalyzingOptimal && optimalCandidates.length === 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Summary */}
              <Card className="p-4 space-y-3">
                <div>
                  <h2 className="font-semibold text-lg mb-2">Ruteinformasjon</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Fra</div>
                        <div className="text-muted-foreground">{route.origin.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Til</div>
                        <div className="text-muted-foreground">{route.destination.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Avreise</div>
                        <div className="text-muted-foreground">
                          {format(route.departureTime, 'EEEE d. MMMM, HH:mm', { locale: nb })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distanse:</span>
                    <span className="font-semibold">{formatDistance(route.distance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reisetid:</span>
                    <span className="font-semibold">{formatDuration(route.duration)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Værvarslingspunkter:</span>
                    <span className="font-semibold">{route.segments.length}</span>
                  </div>
                </div>
              </Card>

              {/* Hazard warnings */}
              {hazardousSegments.length > 0 && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900">Farlige værforhold</h3>
                      <p className="text-sm text-red-800">
                        {hazardousSegments.length} punkt{hazardousSegments.length > 1 ? 'er' : ''} med
                        potensielt farlig vær
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {hazardousSegments.slice(0, 3).map((segment, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-red-900">
                          {format(segment.estimatedArrivalTime, 'HH:mm', { locale: nb })} - {segment.location.name}
                        </div>
                        <div className="text-red-800">
                          {getHazardDescription(segment.hazardType)}
                        </div>
                      </div>
                    ))}
                    {hazardousSegments.length > 3 && (
                      <p className="text-xs text-red-800">
                        + {hazardousSegments.length - 3} flere advarsler
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Timeline of weather points */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Værvarsel langs ruten</h3>
                <TimelineView segments={route.segments} />
              </Card>
            </div>
          )}

          {/* Empty state */}
          {!route && !isLoading && !error && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Søk etter en rute for å se værvarsel</p>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <RouteMap route={route} className="w-full h-full" />
        </main>
      </div>
    </div>
  );
}

function getHazardDescription(hazardType?: string): string {
  const descriptions: Record<string, string> = {
    freezing: 'Fare for glatte veier - temperaturer rundt frysepunktet',
    heavy_precipitation: 'Kraftig nedbør - redusert sikt',
    high_wind: 'Sterk vind - kjør forsiktig',
    mountain: 'Værforhold i fjellet - vær forberedt',
  };
  return descriptions[hazardType || ''] || 'Vær oppmerksom';
}
