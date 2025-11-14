'use client';

import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { TimeCandidate } from '@/lib/types/optimal-time';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Star,
  CloudRain,
  Wind,
  AlertTriangle,
  Thermometer,
  Snowflake,
  CheckCircle2,
} from 'lucide-react';

interface TimeCandidatesProps {
  candidates: TimeCandidate[];
  onSelect: (candidate: TimeCandidate) => void;
}

export function TimeCandidates({ candidates, onSelect }: TimeCandidatesProps) {
  if (candidates.length === 0) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Beste tidspunkt</h3>
        <p className="text-sm text-muted-foreground">{candidates.length} alternativer</p>
      </div>

      {candidates.map((candidate, index) => (
        <Card
          key={candidate.departureTime.toISOString()}
          className={`p-4 ${
            index === 0
              ? 'border-green-500 border-2 bg-green-50'
              : 'hover:bg-accent transition-colors'
          }`}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {format(candidate.departureTime, 'HH:mm', { locale: nb })}
                    </span>
                    {index === 0 && (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Anbefalt
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(candidate.departureTime, 'EEEE d. MMMM', { locale: nb })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className={`flex items-center gap-1 ${getScoreColor(candidate.score)}`}>
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-2xl font-bold">{candidate.score}</span>
                </div>
                <Badge variant={getScoreBadgeVariant(candidate.score)} className="text-xs">
                  {candidate.score >= 80 ? 'Utmerket' : candidate.score >= 60 ? 'Bra' : 'Risiko'}
                </Badge>
              </div>
            </div>

            {/* Weather summary */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">Nedbør:</span>
                <span className="font-medium">
                  {candidate.weatherSummary.maxPrecipitation.toFixed(1)} mm/t
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-600" />
                <span className="text-muted-foreground">Vind:</span>
                <span className="font-medium">
                  {candidate.weatherSummary.maxWindSpeed.toFixed(1)} m/s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-600" />
                <span className="text-muted-foreground">Temp:</span>
                <span className="font-medium">
                  {candidate.weatherSummary.minTemperature.toFixed(0)}° til{' '}
                  {candidate.weatherSummary.maxTemperature.toFixed(0)}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-muted-foreground">Advarsler:</span>
                <span className="font-medium">{candidate.hazardCount}</span>
              </div>
            </div>

            {/* Warning badges */}
            {(candidate.weatherSummary.hasSnow || candidate.weatherSummary.hasFreezingTemp) && (
              <div className="flex gap-2 flex-wrap">
                {candidate.weatherSummary.hasSnow && (
                  <Badge variant="secondary" className="text-xs">
                    <Snowflake className="w-3 h-3 mr-1" />
                    Snø
                  </Badge>
                )}
                {candidate.weatherSummary.hasFreezingTemp && (
                  <Badge variant="secondary" className="text-xs">
                    <Thermometer className="w-3 h-3 mr-1" />
                    Glatte veier
                  </Badge>
                )}
              </div>
            )}

            {/* Action button */}
            <Button
              onClick={() => onSelect(candidate)}
              className="w-full"
              variant={index === 0 ? 'default' : 'outline'}
            >
              {index === 0 ? 'Velg anbefalt tid' : 'Velg dette tidspunktet'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
