'use client';

import { useState, useEffect } from 'react';
import { CityAutocomplete } from './CityAutocomplete';
import { PresetRoutes } from './PresetRoutes';
import { ValidationDisplay, FieldErrorDisplay } from './ValidationDisplay';
import { RecommendationRequest } from '@/lib/schemas';
import { City, getDefaultDateTime } from '@/lib/cities';
import { saveRoute, saveLastSearch, getUserPreferences, saveUserPreferences } from '@/lib/route-memory';
import { validateFormData, ValidationResult } from '@/lib/validation';
import { getUserLocation, findNearestCity } from '@/lib/location-utils';

interface RecommendationFormProps {
  onSubmit: (request: RecommendationRequest) => void;
  isLoading: boolean;
  cities: City[];
  onOriginChange?: (city: City | null) => void;
  onDestinationChange?: (city: City | null) => void;
}

export function RecommendationForm({ 
  onSubmit, 
  isLoading, 
  cities,
  onOriginChange,
  onDestinationChange
}: RecommendationFormProps) {
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [localDateTime, setLocalDateTime] = useState('');
  const [interest, setInterest] = useState<'sunrise' | 'sunset'>('sunrise');
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [showValidation, setShowValidation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Initialize with user preferences
  useEffect(() => {
    initializeForm();
  }, []);

  // Validate form data whenever inputs change
  useEffect(() => {
    if (showValidation) {
      const result = validateFormData({
        origin,
        destination,
        local_datetime: localDateTime,
        interest
      });
      setValidationResult(result);
    }
  }, [origin, destination, localDateTime, interest, showValidation]);

  // Update parent component when cities change
  useEffect(() => {
    if (onOriginChange) {
      onOriginChange(origin);
    }
  }, [origin, onOriginChange]);

  useEffect(() => {
    if (onDestinationChange) {
      onDestinationChange(destination);
    }
  }, [destination, onDestinationChange]);

  const initializeForm = () => {
    const preferences = getUserPreferences();
    
    // Set default interest from preferences
    setInterest(preferences.defaultInterest);
    
    // Set default datetime
    if (!localDateTime) {
      setLocalDateTime(getDefaultDateTime({ name: '', iata: '', lat: 0, lon: 0, tz: 'UTC' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show validation and validate form
    setShowValidation(true);
    const result = validateFormData({
      origin,
      destination,
      local_datetime: localDateTime,
      interest
    });
    setValidationResult(result);

    // If there are errors, don't submit
    if (!result.isValid) {
      return;
    }

    const request: RecommendationRequest = {
      origin: {
        name: origin!.name,
        lat: origin!.lat,
        lon: origin!.lon,
        tz: origin!.tz,
      },
      destination: {
        name: destination!.name,
        lat: destination!.lat,
        lon: destination!.lon,
        tz: destination!.tz,
      },
      local_datetime: localDateTime,
      interest,
    };

    // Save route to memory
    saveRoute(origin!.name, destination!.name, interest);
    saveLastSearch(origin!.name, destination!.name, interest);
    
    // Update user preferences
    saveUserPreferences({
      defaultInterest: interest,
      lastUsedTimezone: origin!.tz,
    });

    onSubmit(request);
  };

  const handlePresetSelect = (preset: {
    origin: City;
    destination: City;
    defaultTime: string;
    interest: 'sunrise' | 'sunset';
  }) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setInterest(preset.interest);
    
    // Set datetime with preset time but current date
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    setLocalDateTime(`${dateStr}T${preset.defaultTime}`);
    
    // Save to route memory
    saveRoute(preset.origin.name, preset.destination.name, preset.interest);
    
    // Clear validation when preset is selected
    setShowValidation(false);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
  };

  // Handle location detection
  const handleUseMyLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const userLocation = await getUserLocation();
      if (userLocation) {
        const nearestCity = findNearestCity(userLocation.lat, userLocation.lon);
        if (nearestCity) {
          setOrigin(nearestCity);
          // Show success message
          console.log(`Location detected! Nearest airport: ${nearestCity.name} (${nearestCity.iata})`);
        }
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      // You could show a toast notification here
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const canSubmit = origin && destination && localDateTime && !isLoading && validationResult.isValid;

  return (
    <div className="space-y-8">
      {/* Preset Routes Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Quick Start
          </label>
        </div>
        <PresetRoutes onSelect={handlePresetSelect} />
      </div>

      {/* Custom Route Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Customize Your Route
          </h3>
        </div>

        {/* Validation Display */}
        {showValidation && (
          <ValidationDisplay 
            errors={validationResult.errors} 
            warnings={validationResult.warnings}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Use My Location Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isDetectingLocation ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Detecting Location...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Location
                </>
              )}
            </button>
          </div>

          {/* Origin and Destination Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin City */}
            <div className="space-y-2">
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>From</span>
                </span>
              </label>
              <CityAutocomplete
                id="origin"
                placeholder="Select origin city..."
                value={origin}
                onChange={setOrigin}
                disabled={isLoading}
              />
              <FieldErrorDisplay 
                errors={validationResult.errors} 
                warnings={validationResult.warnings} 
                fieldName="origin"
              />
            </div>

            {/* Destination City */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>To</span>
                </span>
              </label>
              <CityAutocomplete
                id="destination"
                placeholder="Select destination city..."
                value={destination}
                onChange={setDestination}
                disabled={isLoading}
              />
              <FieldErrorDisplay 
                errors={validationResult.errors} 
                warnings={validationResult.warnings} 
                fieldName="destination"
              />
            </div>
          </div>

          {/* Route-level validation */}
          <FieldErrorDisplay 
            errors={validationResult.errors} 
            warnings={validationResult.warnings} 
            fieldName="route"
          />

          {/* Date and Time Section */}
          <div className="space-y-2">
            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Date & Time</span>
                {origin && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    ({origin.tz})
                  </span>
                )}
              </span>
            </label>
            <input
              type="datetime-local"
              id="datetime"
              value={localDateTime}
              onChange={(e) => setLocalDateTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              required
            />
            <FieldErrorDisplay 
              errors={validationResult.errors} 
              warnings={validationResult.warnings} 
              fieldName="datetime"
            />
          </div>

          {/* Interest Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                <span>I'm interested in</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="interest"
                  value="sunrise"
                  checked={interest === 'sunrise'}
                  onChange={(e) => setInterest(e.target.value as 'sunrise' | 'sunset')}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                  interest === 'sunrise'
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-600'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      interest === 'sunrise'
                        ? 'border-yellow-500 bg-yellow-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {interest === 'sunrise' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl">🌅</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Sunrise</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Early morning views</div>
                    </div>
                  </div>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="interest"
                  value="sunset"
                  checked={interest === 'sunset'}
                  onChange={(e) => setInterest(e.target.value as 'sunrise' | 'sunset')}
                  className="sr-only"
                />
                <div className={`p-4 rounded-xl border-2 transition-all duration-200 group-hover:scale-105 ${
                  interest === 'sunset'
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      interest === 'sunset'
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {interest === 'sunset' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl">🌇</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Sunset</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Evening landscapes</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            <FieldErrorDisplay 
              errors={validationResult.errors} 
              warnings={validationResult.warnings} 
              fieldName="interest"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Getting Recommendation...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get Recommendation</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
