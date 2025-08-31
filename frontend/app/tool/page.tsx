'use client';

import { useState } from 'react';
import { RecommendationForm } from '@/components/RecommendationForm';
import { AirplaneSeatLayout } from '@/components/AirplaneSeatLayout';
import { RecommendationRequest, RecommendationResponse } from '@/lib/schemas';
import { City, CITIES } from '@/lib/cities';
import { calculateFlightDetails } from '@/lib/flight-calculator';
import { MapView } from '@/components/MapView';

export default function ToolPage() {
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('');
  const [lastRequest, setLastRequest] = useState<RecommendationRequest | null>(null);

  const handleRecommendationRequest = async (request: RecommendationRequest) => {
    setIsLoading(true);
    setError(null);
    
    // Store flight details
    setOriginCity({
      name: request.origin.name,
      iata: '',
      lat: request.origin.lat,
      lon: request.origin.lon,
      tz: request.origin.tz,
    });
    setDestinationCity({
      name: request.destination.name,
      iata: '',
      lat: request.destination.lat,
      lon: request.destination.lon,
      tz: request.destination.tz,
    });
    setDepartureTime(request.local_datetime);
    setLastRequest(request);

    try {
      const response = await fetch('http://localhost:8003/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate flight details
  const flightDetails = originCity && destinationCity && departureTime 
    ? calculateFlightDetails(
        { lat: originCity.lat, lon: originCity.lon, tz: originCity.tz },
        { lat: destinationCity.lat, lon: destinationCity.lon, tz: destinationCity.tz },
        departureTime
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Scenic Seat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Find the perfect window seat for your flight based on sun position and golden hour timing
          </p>
          <div className="flex justify-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              🌅 Golden Hour
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              🗺️ Interactive Map
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              ✈️ Flight Analysis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">

              <RecommendationForm
                onSubmit={handleRecommendationRequest}
                isLoading={isLoading}
                cities={CITIES}
                onOriginChange={setOriginCity}
                onDestinationChange={setDestinationCity}
              />
            </div>




          </div>

          {/* Right Side - Airplane Seat Layout */}
          <div className="lg:col-span-2">
            {/* Loading State */}
            {isLoading && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full mx-auto mb-4"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Calculating Your Scenic Seat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Analyzing sun position and optimal seating...
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                      Something went wrong
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Airplane Seat Layout */}
            {recommendation && !isLoading && flightDetails && (
              <AirplaneSeatLayout
                flightDirection={lastRequest?.interest === 'sunset' ? 270 : 90} // Use user preference instead of bearing
                currentTime={departureTime}
                departureTime={originCity?.name || ''}
                arrivalTime={destinationCity?.name || ''}
                flightDuration={`${Math.round(flightDetails.estimatedDuration)}h ${Math.round((flightDetails.estimatedDuration % 1) * 60)}m`}
                flightStatus="On Time"
                originCity={originCity}
                destinationCity={destinationCity}
                recommendation={recommendation}
                interestType={lastRequest?.interest || 'sunrise'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
