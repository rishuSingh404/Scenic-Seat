'use client';

import { useMemo } from 'react';
import { PhaseTimes } from '@/lib/schemas';

interface PhaseBarProps {
  phaseTimes: PhaseTimes;
  currentTime: string;
  timezone: string;
  interest: 'sunrise' | 'sunset';
}

interface TimeSegment {
  start: number;
  end: number;
  type: 'night' | 'civil_twilight' | 'golden_hour' | 'day';
  color: string;
  label: string;
}

export function PhaseBar({ phaseTimes, currentTime, timezone, interest }: PhaseBarProps) {
  // Convert time strings to minutes since midnight for easier calculation
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const date = new Date(timeStr);
      return date.getHours() * 60 + date.getMinutes();
    } catch (error) {
      console.error('Failed to parse time:', timeStr);
      return 0;
    }
  };

  const currentTimeMinutes = parseTimeToMinutes(currentTime);

  // Calculate time segments for the day
  const segments = useMemo((): TimeSegment[] => {
    const civilDawn = parseTimeToMinutes(phaseTimes.civil_dawn);
    const sunrise = parseTimeToMinutes(phaseTimes.sunrise);
    const sunset = parseTimeToMinutes(phaseTimes.sunset);
    const civilDusk = parseTimeToMinutes(phaseTimes.civil_dusk);

    // Golden hour periods (±45 minutes around sunrise/sunset)
    const goldenHourMorningStart = Math.max(0, sunrise - 45);
    const goldenHourMorningEnd = Math.min(1440, sunrise + 45);
    const goldenHourEveningStart = Math.max(0, sunset - 45);
    const goldenHourEveningEnd = Math.min(1440, sunset + 45);

    const timeSegments: TimeSegment[] = [
      // Night (start of day to civil dawn)
      {
        start: 0,
        end: civilDawn,
        type: 'night',
        color: 'bg-slate-800',
        label: 'Night'
      },
      // Civil twilight (civil dawn to sunrise)
      {
        start: civilDawn,
        end: sunrise,
        type: 'civil_twilight',
        color: 'bg-slate-600',
        label: 'Civil Dawn'
      },
      // Golden hour morning (sunrise ±45 min)
      {
        start: goldenHourMorningStart,
        end: goldenHourMorningEnd,
        type: 'golden_hour',
        color: 'bg-orange-400',
        label: 'Golden Hour'
      },
      // Day (after morning golden hour to evening golden hour)
      {
        start: goldenHourMorningEnd,
        end: goldenHourEveningStart,
        type: 'day',
        color: 'bg-sky-300',
        label: 'Day'
      },
      // Golden hour evening (sunset ±45 min)
      {
        start: goldenHourEveningStart,
        end: goldenHourEveningEnd,
        type: 'golden_hour',
        color: 'bg-orange-400',
        label: 'Golden Hour'
      },
      // Civil twilight (sunset to civil dusk)
      {
        start: sunset,
        end: civilDusk,
        type: 'civil_twilight',
        color: 'bg-slate-600',
        label: 'Civil Dusk'
      },
      // Night (civil dusk to end of day)
      {
        start: civilDusk,
        end: 1440,
        type: 'night',
        color: 'bg-slate-800',
        label: 'Night'
      }
    ];

    // Sort by start time and merge overlapping segments of same type
    return timeSegments
      .sort((a, b) => a.start - b.start)
      .filter(segment => segment.end > segment.start);
  }, [phaseTimes]);

  // Format time for display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate position percentage for timeline
  const getPosition = (minutes: number): number => {
    return (minutes / 1440) * 100; // 1440 minutes in a day
  };

  // Get current time position
  const currentPosition = getPosition(currentTimeMinutes);

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Solar Timeline</h3>
        <div className="text-xs text-gray-500">
          {timezone}
        </div>
      </div>

      {/* Timeline container */}
      <div className="relative">
        {/* Background timeline */}
        <div className="h-8 bg-gray-200 rounded-full relative overflow-hidden">
          {/* Render segments */}
          {segments.map((segment, index) => {
            const width = getPosition(segment.end) - getPosition(segment.start);
            const left = getPosition(segment.start);
            
            if (width <= 0) return null;

            return (
              <div
                key={index}
                className={`absolute h-full ${segment.color} transition-opacity duration-300`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  opacity: segment.type === 'golden_hour' ? 0.9 : 0.7
                }}
                title={`${segment.label}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`}
              />
            );
          })}

          {/* Current time marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10 transition-all duration-300"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>12:00 AM</span>
          <span>6:00 AM</span>
          <span>12:00 PM</span>
          <span>6:00 PM</span>
          <span>12:00 AM</span>
        </div>

        {/* Key solar events */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-slate-600 rounded-full mr-2"></div>
              <span>Civil Dawn</span>
            </div>
            <span className="font-medium">{formatTime(parseTimeToMinutes(phaseTimes.civil_dawn))}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <span>Sunrise</span>
            </div>
            <span className="font-medium">{formatTime(parseTimeToMinutes(phaseTimes.sunrise))}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <span>Sunset</span>
            </div>
            <span className="font-medium">{formatTime(parseTimeToMinutes(phaseTimes.sunset))}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-slate-600 rounded-full mr-2"></div>
              <span>Civil Dusk</span>
            </div>
            <span className="font-medium">{formatTime(parseTimeToMinutes(phaseTimes.civil_dusk))}</span>
          </div>
        </div>

        {/* Current time display */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Current Selection
            </span>
            <span className="text-sm font-medium text-blue-600">
              {formatTime(currentTimeMinutes)}
            </span>
          </div>
        </div>

        {/* Interest highlight */}
        {interest && (
          <div className="mt-2">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Optimizing for:</span>{' '}
              {interest === 'sunrise' ? '🌅 Sunrise' : '🌇 Sunset'}
              {' '}viewing
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



