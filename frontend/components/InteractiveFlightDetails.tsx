'use client';

import { useState, useEffect, useMemo } from 'react';
import { FlightDetails, calculateFlightDetails, getFlightUpdates } from '@/lib/flight-calculator';
import { City } from '@/lib/cities';

interface InteractiveFlightDetailsProps {
  origin: City;
  destination: City;
  departureTime: string;
  className?: string;
}

export function InteractiveFlightDetails({ 
  origin, 
  destination, 
  departureTime, 
  className = '' 
}: InteractiveFlightDetailsProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'weather' | 'solar'>('overview');

  // Calculate flight details
  const flightDetails = useMemo(() => {
    return calculateFlightDetails(
      { lat: origin.lat, lon: origin.lon, tz: origin.tz },
      { lat: destination.lat, lon: destination.lon, tz: destination.tz },
      departureTime
    );
  }, [origin, destination, departureTime]);

  // Get real-time updates
  const flightUpdates = useMemo(() => {
    return getFlightUpdates(flightDetails, currentTime);
  }, [flightDetails, currentTime]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDistance = (km: number): string => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}k km`;
    }
    return `${Math.round(km)} km`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 dark:text-blue-400';
      case 'In Flight': return 'text-green-600 dark:text-green-400';
      case 'Arrived': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 25) return 'bg-blue-500';
    if (progress < 75) return 'bg-green-500';
    return 'bg-purple-500';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Flight Details
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Flight Status */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getProgressColor(flightUpdates.progress)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(flightUpdates.status)}`}>
                {flightUpdates.status}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(flightUpdates.progress)}`}
                style={{ width: `${flightUpdates.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Departure</span>
              <span>{Math.round(flightUpdates.progress)}%</span>
              <span>Arrival</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDistance(flightDetails.distance)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDuration(flightDetails.estimatedDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '✈️' },
              { id: 'timeline', label: 'Timeline', icon: '🕐' },
              { id: 'weather', label: 'Weather', icon: '🌤️' },
              { id: 'solar', label: 'Solar', icon: '☀️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Route Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Origin</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="font-semibold">{origin.name}</div>
                      <div>{origin.tz}</div>
                      <div>{flightDetails.localDepartureTime}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Destination</h4>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <div className="font-semibold">{destination.name}</div>
                      <div>{destination.tz}</div>
                      <div>{flightDetails.localArrivalTime}</div>
                    </div>
                  </div>
                </div>

                {/* Flight Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDistance(flightDetails.distance)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(flightDetails.estimatedDuration)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {flightDetails.timezoneDifference > 0 ? '+' : ''}{flightDetails.timezoneDifference}h
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Time Diff</div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Altitude:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {Math.round(flightUpdates.currentAltitude)} km
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {Math.round(flightUpdates.timeRemaining)} min
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Next Milestone:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {flightUpdates.nextMilestone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Flight Timeline</h4>
                
                {/* Flight Phases */}
                <div className="space-y-3">
                  {[
                    { phase: 'Boarding', time: '0%', status: flightUpdates.progress >= 0 ? 'completed' : 'pending' },
                    { phase: 'Takeoff', time: '5%', status: flightUpdates.progress >= 5 ? 'completed' : 'pending' },
                    { phase: 'Climb', time: '15%', status: flightUpdates.progress >= 15 ? 'completed' : 'pending' },
                    { phase: 'Cruise', time: '50%', status: flightUpdates.progress >= 50 ? 'completed' : 'pending' },
                    { phase: 'Descent', time: '85%', status: flightUpdates.progress >= 85 ? 'completed' : 'pending' },
                    { phase: 'Landing', time: '95%', status: flightUpdates.progress >= 95 ? 'completed' : 'pending' },
                    { phase: 'Arrival', time: '100%', status: flightUpdates.progress >= 100 ? 'completed' : 'pending' }
                  ].map((phase, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        phase.status === 'completed' 
                          ? 'bg-green-500' 
                          : flightUpdates.progress >= parseInt(phase.time) 
                            ? 'bg-yellow-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{phase.phase}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{phase.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Weather Conditions</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">👁️</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">Visibility</span>
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">
                      {flightDetails.weatherConditions.visibility}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">☁️</span>
                      <span className="font-medium text-gray-900 dark:text-white">Cloud Cover</span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {flightDetails.weatherConditions.cloudCover}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🌊</span>
                      <span className="font-medium text-yellow-900 dark:text-yellow-100">Turbulence</span>
                    </div>
                    <div className="text-yellow-700 dark:text-yellow-300">
                      {flightDetails.weatherConditions.turbulence}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solar' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Solar Events at Destination</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🌅</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">Sunrise</span>
                    </div>
                    <div className="text-orange-700 dark:text-orange-300 text-lg font-semibold">
                      {flightDetails.solarEvents.sunrise}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🌇</span>
                      <span className="font-medium text-red-900 dark:text-red-100">Sunset</span>
                    </div>
                    <div className="text-red-700 dark:text-red-300 text-lg font-semibold">
                      {flightDetails.solarEvents.sunset}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <span className="font-medium text-yellow-900 dark:text-yellow-100">Golden Hour</span>
                    </div>
                    <div className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {flightDetails.solarEvents.goldenHour}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🌌</span>
                      <span className="font-medium text-blue-900 dark:text-blue-100">Blue Hour</span>
                    </div>
                    <div className="text-blue-700 dark:text-blue-300 text-sm">
                      {flightDetails.solarEvents.blueHour}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



