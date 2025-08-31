'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface TimeScrubberProps {
  currentTime: string;
  onTimeChange: (newTime: string) => void;
  onInteractionEnd?: () => void;
  disabled?: boolean;
  timezone: string;
  interest?: 'sunrise' | 'sunset';
}

export function TimeScrubber({ 
  currentTime, 
  onTimeChange, 
  onInteractionEnd, 
  disabled = false,
  timezone,
  interest
}: TimeScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Convert time string to minutes since the base time
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const date = new Date(timeStr);
      return date.getHours() * 60 + date.getMinutes();
    } catch (error) {
      return 0;
    }
  };

  // Convert minutes back to time string
  const minutesToTimeString = (minutes: number, baseTimeStr: string): string => {
    try {
      const baseDate = new Date(baseTimeStr);
      const newDate = new Date(baseDate);
      
      // Add the minute offset
      newDate.setMinutes(newDate.getMinutes() + minutes);
      
      // Format as YYYY-MM-DDTHH:MM
      return newDate.toISOString().slice(0, 16);
    } catch (error) {
      return baseTimeStr;
    }
  };

  // Initialize slider value based on current time (0 = current time)
  useEffect(() => {
    setSliderValue(0);
  }, [currentTime]);

  // Handle slider value changes (but don't update time until interaction ends)
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
  }, []);

  // Handle interaction start
  const handleInteractionStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle interaction end - this is when we actually update the time and trigger recompute
  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    
    // Calculate new time based on slider value
    const newTime = minutesToTimeString(sliderValue, currentTime);
    onTimeChange(newTime);
    
    // Trigger recomputation
    if (onInteractionEnd) {
      onInteractionEnd();
    }
  }, [sliderValue, currentTime, onTimeChange, onInteractionEnd]);

  // Calculate preview time for display during dragging
  const previewTime = useMemo(() => {
    if (isDragging) {
      return minutesToTimeString(sliderValue, currentTime);
    }
    return currentTime;
  }, [isDragging, sliderValue, currentTime]);

  // Format time for display
  const formatDisplayTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeStr;
    }
  };

  // Get offset description
  const getOffsetDescription = (minutes: number): string => {
    if (minutes === 0) return 'Current time';
    
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    
    let timeStr = '';
    if (hours > 0) {
      timeStr += `${hours}h`;
      if (mins > 0) timeStr += ` ${mins}m`;
    } else {
      timeStr = `${mins}m`;
    }
    
    return minutes > 0 ? `+${timeStr}` : `-${timeStr}`;
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Time Scrubber</h3>
        <div className="text-xs text-gray-500">
          ±3 hours from departure
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center mb-4">
        <div className="text-lg font-mono font-medium text-gray-900">
          {formatDisplayTime(previewTime)}
        </div>
        <div className="text-sm text-gray-600">
          {getOffsetDescription(sliderValue)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {timezone}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-4">
        <input
          type="range"
          min={-180} // -3 hours in minutes
          max={180}  // +3 hours in minutes
          step={15}  // 15-minute increments
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            background: `linear-gradient(to right, 
              #3b82f6 0%, 
              #3b82f6 ${((sliderValue + 180) / 360) * 100}%, 
              #e5e7eb ${((sliderValue + 180) / 360) * 100}%, 
              #e5e7eb 100%)`
          }}
        />
        
        {/* Center marker (original time) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500 rounded-full"></div>
        
        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>-3h</span>
          <span>-1.5h</span>
          <span className="font-medium text-red-600">Now</span>
          <span>+1.5h</span>
          <span>+3h</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center">
        {isDragging ? (
          <div className="flex items-center text-sm text-blue-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Release to update
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Drag to explore different times
          </div>
        )}
      </div>

      {/* Interest indicator */}
      {interest && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">
              Optimizing for
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              interest === 'sunrise' 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {interest === 'sunrise' ? '🌅' : '🌇'} {interest.charAt(0).toUpperCase() + interest.slice(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom CSS for the slider (add to globals.css)
export const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
  border: none;
}

.slider:disabled::-webkit-slider-thumb {
  background: #9ca3af;
  cursor: not-allowed;
}

.slider:disabled::-moz-range-thumb {
  background: #9ca3af;
  cursor: not-allowed;
}
`;
