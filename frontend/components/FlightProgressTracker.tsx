'use client';

import { useState, useEffect, useMemo } from 'react';
import { FlightProgress, calculateFlightProgress } from '@/lib/flight-calculator';
import { City } from '@/lib/cities';

interface FlightProgressTrackerProps {
  origin: City;
  destination: City;
  departureTime: string;
  estimatedDuration: number;
  className?: string;
}

export function FlightProgressTracker({ 
  origin, 
  destination, 
  departureTime, 
  estimatedDuration,
  className = '' 
}: FlightProgressTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate flight progress
  const flightProgress = useMemo(() => {
    return calculateFlightProgress(departureTime, estimatedDuration, currentTime);
  }, [departureTime, estimatedDuration, currentTime]);

  // Update current time every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Trigger animation when progress changes significantly
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [Math.floor(flightProgress.progress / 10)]); // Animate every 10% progress

  const getPhaseInfo = (progress: number) => {
    if (progress < 5) return { phase: 'Boarding', icon: '🚪', color: 'text-blue-500' };
    if (progress < 15) return { phase: 'Takeoff', icon: '🛫', color: 'text-green-500' };
    if (progress < 25) return { phase: 'Climb', icon: '📈', color: 'text-yellow-500' };
    if (progress < 75) return { phase: 'Cruise', icon: '✈️', color: 'text-blue-600' };
    if (progress < 90) return { phase: 'Descent', icon: '📉', color: 'text-orange-500' };
    if (progress < 98) return { phase: 'Landing', icon: '🛬', color: 'text-red-500' };
    return { phase: 'Arrived', icon: '🎉', color: 'text-purple-500' };
  };

  const phaseInfo = getPhaseInfo(flightProgress.progress);

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getAltitudeColor = (altitude: number): string => {
    if (altitude < 30) return 'text-blue-500';
    if (altitude < 60) return 'text-green-500';
    if (altitude < 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flight Progress
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isAnimating ? 'animate-pulse' : ''} bg-green-500`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </div>

        {/* Current Phase */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">{phaseInfo.icon}</span>
            <div>
              <div className={`font-semibold ${phaseInfo.color}`}>
                {phaseInfo.phase}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flightProgress.nextWaypoint}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                isAnimating ? 'animate-pulse' : ''
              } bg-gradient-to-r from-blue-500 to-indigo-500`}
              style={{ width: `${flightProgress.progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>0%</span>
            <span className="font-medium">{Math.round(flightProgress.progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Flight Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">⏱️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTimeRemaining(flightProgress.timeRemaining)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🛩️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Altitude</span>
            </div>
            <div className={`text-2xl font-bold ${getAltitudeColor(flightProgress.currentPosition.altitude)}`}>
              {Math.round(flightProgress.currentPosition.altitude)} km
            </div>
          </div>
        </div>

        {/* Flight Path Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Flight Path</h4>
          
          <div className="relative">
            {/* Route Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>
            
            {/* Progress Indicator */}
            <div 
              className="absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg"
              style={{ left: `${flightProgress.progress}%` }}
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
            
            {/* Waypoints */}
            <div className="relative z-10 flex justify-between items-center h-8">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Origin</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Mid</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Dest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date(currentTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



