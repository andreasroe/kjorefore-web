'use client';

import { TimeCandidate } from '@/lib/types/optimal-time';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface TimeSummaryProps {
  candidates: TimeCandidate[];
}

export function TimeSummary({ candidates }: TimeSummaryProps) {
  if (candidates.length === 0) return null;

  // Calculate score statistics
  const scores = candidates.map(c => c.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const bestCandidate = candidates[0]; // Already sorted by score

  // Find time window for good candidates (within 10 points of best)
  const goodCandidates = candidates.filter(c => c.score >= bestCandidate.score - 10);
  const hasTimeWindow = goodCandidates.length > 1;

  // Get time range for good candidates
  const getTimeRange = () => {
    if (!hasTimeWindow) return null;
    // goodCandidates is sorted by score (highest first), so we need to find earliest and latest times
    const times = goodCandidates.map(c => c.departureTime).sort((a, b) => a.getTime() - b.getTime());
    const startTime = format(times[0], 'HH:mm', { locale: nb });
    const endTime = format(times[times.length - 1], 'HH:mm', { locale: nb });
    return `${startTime}-${endTime}`;
  };

  // Determine the situation
  const allGood = avgScore >= 80; // Average is excellent
  const mostlyGood = avgScore >= 70 && minScore >= 60; // Most times are good
  const mostlyBad = avgScore < 50; // Average is poor
  const narrowWindow = maxScore - minScore <= 10; // Not much difference (stricter now)

  // Scenario 1: All times are good and similar
  if (allGood && narrowWindow) {
    const timeRange = getTimeRange();
    return (
      <Card className="p-4 bg-green-50 border-green-200 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-1">Gode forhold hele dagen</h3>
            <p className="text-sm text-green-800">
              Det er generelt fine værforhold langs ruten{timeRange ? ` mellom kl. ${timeRange}` : ''}. Det er ikke så nøye når du kjører -
              alle tidspunktene er relativt like gode.
            </p>
          </div>
          <Badge className="bg-green-600 whitespace-nowrap">
            Snitt {Math.round(avgScore)}
          </Badge>
        </div>
      </Card>
    );
  }

  // Scenario 2: Most times are good
  if (mostlyGood) {
    const timeRange = getTimeRange();
    return (
      <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Generelt gode forhold</h3>
            <p className="text-sm text-blue-800">
              De fleste tidspunktene har fine værforhold.
              {hasTimeWindow ? (
                <>
                  Anbefaler å kjøre mellom <strong>{timeRange}</strong> (score {bestCandidate.score}).
                </>
              ) : (
                <>
                  Beste tid er <strong>{format(bestCandidate.departureTime, 'HH:mm', { locale: nb })}</strong> med
                  score {bestCandidate.score}.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Scenario 3: Mostly bad conditions, but one time is clearly better
  if (mostlyBad) {
    const scoreDifference = bestCandidate.score - candidates[candidates.length - 1].score;
    const significantDifference = scoreDifference >= 20;
    const timeRange = getTimeRange();

    if (significantDifference) {
      return (
        <Card className="p-4 bg-orange-50 border-orange-200 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">Utfordrende forhold - viktig å velge riktig tid</h3>
              <p className="text-sm text-orange-800 mb-2">
                Det er generelt utfordrende værforhold langs ruten. Anbefaler sterkt å kjøre:
              </p>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-orange-300">
                <Clock className="w-5 h-5 text-orange-700" />
                <div className="flex-1">
                  <div className="font-bold text-orange-900 text-lg">
                    {hasTimeWindow ? timeRange : format(bestCandidate.departureTime, 'HH:mm', { locale: nb })}
                  </div>
                  <div className="text-xs text-orange-700">
                    {format(bestCandidate.departureTime, 'EEEE d. MMMM', { locale: nb })}
                  </div>
                </div>
                <Badge className="bg-orange-600">
                  Score {bestCandidate.score}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      );
    } else {
      return (
        <Card className="p-4 bg-red-50 border-red-200 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Vanskelige forhold hele dagen</h3>
              <p className="text-sm text-red-800">
                Det er utfordrende værforhold på alle tidspunkter{timeRange ? ` mellom kl. ${timeRange}` : ''}.
                {hasTimeWindow ? (
                  <>
                    Beste alternativ er mellom <strong>{timeRange}</strong> (score {bestCandidate.score}),
                    men vurder om turen kan utsettes.
                  </>
                ) : (
                  <>
                    Beste alternativ er <strong>{format(bestCandidate.departureTime, 'HH:mm', { locale: nb })}</strong> (score {bestCandidate.score}),
                    men vurder om turen kan utsettes.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      );
    }
  }

  // Scenario 4: Mixed conditions - show best time or time window
  const timeRange = getTimeRange();
  return (
    <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
      <div className="flex items-start gap-3">
        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Varierende forhold</h3>
          <p className="text-sm text-blue-800">
            Værforholdene varierer en del gjennom dagen.
            {hasTimeWindow ? (
              <>
                Anbefaler å kjøre mellom <strong>{timeRange}</strong> for best forhold (score {bestCandidate.score}).
              </>
            ) : (
              <>
                Anbefaler å kjøre <strong>{format(bestCandidate.departureTime, 'HH:mm', { locale: nb })}</strong> for
                best forhold (score {bestCandidate.score}).
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}
