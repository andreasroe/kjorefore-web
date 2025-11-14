'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface TimeWindowPickerProps {
  startHour: number;
  endHour: number;
  onChange: (start: number, end: number) => void;
}

export function TimeWindowPicker({ startHour, endHour, onChange }: TimeWindowPickerProps) {
  const [start, setStart] = useState(startHour);
  const [end, setEnd] = useState(endHour);

  const handleStartChange = (value: number) => {
    const newStart = Math.min(value, end - 1);
    setStart(newStart);
    onChange(newStart, end);
  };

  const handleEndChange = (value: number) => {
    const newEnd = Math.max(value, start + 1);
    setEnd(newEnd);
    onChange(start, newEnd);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Tidsvindu for søk</Label>
        <p className="text-xs text-muted-foreground mb-4">
          Vi tester hvert hele time i dette vinduet
        </p>
      </div>

      <div className="space-y-4">
        {/* Start time */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="start-time" className="text-sm">
              Tidligste avreise
            </Label>
            <span className="text-sm font-semibold">{formatHour(start)}</span>
          </div>
          <input
            id="start-time"
            type="range"
            min="0"
            max="23"
            value={start}
            onChange={(e) => handleStartChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* End time */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="end-time" className="text-sm">
              Seneste avreise
            </Label>
            <span className="text-sm font-semibold">{formatHour(end)}</span>
          </div>
          <input
            id="end-time"
            type="range"
            min="0"
            max="23"
            value={end}
            onChange={(e) => handleEndChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Vi vil analysere <strong>{end - start + 1}</strong> tidspunkter mellom{' '}
          <strong>{formatHour(start)}</strong> og <strong>{formatHour(end)}</strong>
        </p>
      </div>
    </Card>
  );
}
