'use client';

import { useState, useEffect } from 'react';
import { City } from '@/lib/cities';
import { getUserLocation, findNearestCity, getSmartDefaultTime } from '@/lib/location-utils';
import { getRecentRoutes, getSuggestedRoutes, getRouteStats, saveRoute } from '@/lib/route-memory';
import { UserLocation } from '@/lib/location-utils';

interface SmartDefaultsProps {
  onRouteSelect: (route: {
    origin: City;
    destination: City;
    defaultTime: string;
    interest: 'sunrise' | 'sunset';
  }) => void;
  cities: City[];
}

export function SmartDefaults({ onRouteSelect, cities }: SmartDefaultsProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);
  const [suggestedRoutes, setSuggestedRoutes] = useState<any[]>([]);
  const [routeStats, setRouteStats] = useState<any>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadSmartDefaults();
  }, []);

  const loadSmartDefaults = () => {
    const recent = getRecentRoutes();
    const suggested = getSuggestedRoutes();
    const stats = getRouteStats();
    
    setRecentRoutes(recent);
    setSuggestedRoutes(suggested);
    setRouteStats(stats);
    
    // Check if we should prompt for location
    const preferences = localStorage.getItem('scenic-seat-user-preferences');
    if (preferences) {
      const prefs = JSON.parse(preferences);
      if (prefs.autoDetectLocation && !userLocation) {
        setShowLocationPrompt(true);
      }
    }
  };

  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    setShowLocationPrompt(false);
    
    try {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
        
        // Find nearest city
        const nearestCity = findNearestCity(location.lat, location.lon, cities);
        if (nearestCity) {
          // Update user preferences with detected timezone
          localStorage.setItem('scenic-seat-user-preferences', JSON.stringify({
            ...JSON.parse(localStorage.getItem('scenic-seat-user-preferences') || '{}'),
            lastUsedTimezone: location.timezone,
          }));
        }
      }
    } catch (error) {
      console.warn('Location detection failed:', error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleRecentRouteClick = (route: any) => {
    // Find the actual city objects
    const originCity = cities.find(city => city.name === route.origin);
    const destCity = cities.find(city => city.name === route.destination);
    
    if (originCity && destCity) {
      // Get smart default time for this route
      const defaultTime = getSmartDefaultTime(route.interest, userLocation?.timezone || 'UTC');
      
      onRouteSelect({
        origin: originCity,
        destination: destCity,
        defaultTime,
        interest: route.interest,
      });
      
      // Update usage count
      saveRoute(route.origin, route.destination, route.interest);
      loadSmartDefaults(); // Refresh the display
    }
  };

  const handleSuggestedRouteClick = (route: any) => {
    handleRecentRouteClick(route);
  };

  if (recentRoutes.length === 0 && !showLocationPrompt) {
    return null; // Don't show if no data and no location prompt
  }

  return (
    <div className="space-y-6">
      {/* Location Detection Prompt */}
      {showLocationPrompt && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Enable Location Detection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized route suggestions based on your location</p>
              </div>
            </div>
            <button
              onClick={detectUserLocation}
              disabled={isDetectingLocation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDetectingLocation ? 'Detecting...' : 'Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Routes */}
      {recentRoutes.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800/50">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Recent Routes
            </h4>
            {routeStats && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {routeStats.totalSearches} searches
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {recentRoutes.slice(0, 3).map((route, index) => (
              <button
                key={index}
                onClick={() => handleRecentRouteClick(route)}
                className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-900 dark:group-hover:text-green-100">
                      {route.origin} → {route.destination}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {route.interest === 'sunrise' ? '🌅' : '🌇'} {route.interest} • Used {route.usageCount} time{route.usageCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-green-400 dark:text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Routes */}
      {suggestedRoutes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800/50">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Suggested for You
            </h4>
            {routeStats && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                Based on your {routeStats.favoriteInterest} preference
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {suggestedRoutes.slice(0, 2).map((route, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedRouteClick(route)}
                className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-900 dark:group-hover:text-purple-100">
                      {route.origin} → {route.destination}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {route.interest === 'sunrise' ? '🌅' : '🌇'} {route.interest} • Popular choice
                    </div>
                  </div>
                  <div className="text-purple-400 dark:text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Location Info */}
      {userLocation && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800/50">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Your Location
            </h4>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div>Timezone: {userLocation.timezone}</div>
            <div>Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</div>
          </div>
        </div>
      )}
    </div>
  );
}



