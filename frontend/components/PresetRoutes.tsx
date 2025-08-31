'use client';

import { PRESET_ROUTES } from '@/lib/cities';
import { City } from '@/lib/cities';

interface PresetRoutesProps {
  onSelect: (preset: {
    origin: City;
    destination: City;
    defaultTime: string;
    interest: 'sunrise' | 'sunset';
  }) => void;
}

// Helper function to estimate flight duration based on distance
const estimateFlightDuration = (origin: City, destination: City): string => {
  // Simple great circle distance calculation
  const R = 6371; // Earth's radius in km
  const lat1 = origin.lat * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const deltaLat = (destination.lat - origin.lat) * Math.PI / 180;
  const deltaLon = (destination.lon - origin.lon) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Estimate flight time (assuming average speed of 800 km/h)
  const flightTimeHours = distance / 800;
  
  if (flightTimeHours < 1) {
    return `${Math.round(flightTimeHours * 60)}m`;
  } else if (flightTimeHours < 2) {
    return `${Math.round(flightTimeHours)}h`;
  } else {
    const hours = Math.floor(flightTimeHours);
    const minutes = Math.round((flightTimeHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }
};

export function PresetRoutes({ onSelect }: PresetRoutesProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {PRESET_ROUTES.map((preset, index) => {
        const duration = estimateFlightDuration(preset.origin, preset.destination);
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(preset)}
            className="group relative text-left p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:shadow-md dark:hover:shadow-blue-900/20 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {/* Route Icon */}
            <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            <div className="space-y-2">
              {/* Route Name */}
              <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                {preset.name}
              </div>
              
              {/* Route Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{preset.defaultTime}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    {preset.interest === 'sunrise' ? '🌅' : '🌇'}
                    <span className="capitalize">{preset.interest}</span>
                  </span>
                </div>
                
                {/* Flight Duration */}
                <div className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{duration}</span>
                </div>
              </div>

              {/* Route Description */}
              <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {preset.interest === 'sunrise' 
                  ? 'Perfect for early morning views and golden hour photography'
                  : 'Ideal for evening landscapes and dramatic sky colors'
                }
              </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-3 right-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
