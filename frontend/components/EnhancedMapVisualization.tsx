'use client';

import { useState, useEffect, useMemo } from 'react';
import { City } from '@/lib/cities';

interface EnhancedMapVisualizationProps {
  origin: City;
  destination: City;
  currentTime: string;
  weatherData?: {
    visibility: string;
    cloudCover: string;
    turbulence: string;
  };
  terrainData?: {
    elevation: number;
    type: string;
    features: string[];
  };
  className?: string;
}

interface WeatherLayer {
  id: string;
  type: 'clouds' | 'precipitation' | 'wind' | 'visibility';
  intensity: number; // 0-1
  color: string;
  opacity: number;
}

interface TerrainFeature {
  id: string;
  type: 'mountain' | 'valley' | 'plateau' | 'coast';
  position: { lat: number; lon: number };
  elevation: number;
  size: number;
}

export function EnhancedMapVisualization({
  origin,
  destination,
  currentTime,
  weatherData,
  terrainData,
  className = ''
}: EnhancedMapVisualizationProps) {
  const [activeLayers, setActiveLayers] = useState({
    weather: true,
    terrain: false,
    elevation: false,
    timeOfDay: true
  });
  const [weatherLayers, setWeatherLayers] = useState<WeatherLayer[]>([]);
  const [terrainFeatures, setTerrainFeatures] = useState<TerrainFeature[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  // Calculate time of day based on current time
  useEffect(() => {
    if (currentTime) {
      const date = new Date(currentTime);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
      else if (hour >= 8 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 21) setTimeOfDay('dusk');
      else setTimeOfDay('night');
    }
  }, [currentTime]);

  // Generate weather layers based on weather data
  useEffect(() => {
    if (weatherData && activeLayers.weather) {
      const layers: WeatherLayer[] = [];
      
      // Cloud cover layer
      if (weatherData.cloudCover !== 'Clear') {
        const cloudIntensity = weatherData.cloudCover === 'Partly Cloudy' ? 0.3 : 0.7;
        layers.push({
          id: 'clouds',
          type: 'clouds',
          intensity: cloudIntensity,
          color: '#ffffff',
          opacity: cloudIntensity * 0.8
        });
      }
      
      // Visibility layer
      if (weatherData.visibility === 'Moderate') {
        layers.push({
          id: 'visibility',
          type: 'visibility',
          intensity: 0.5,
          color: '#f3f4f6',
          opacity: 0.3
        });
      }
      
      // Wind layer (simulated)
      if (weatherData.turbulence === 'Moderate') {
        layers.push({
          id: 'wind',
          type: 'wind',
          intensity: 0.6,
          color: '#dbeafe',
          opacity: 0.4
        });
      }
      
      setWeatherLayers(layers);
    } else {
      setWeatherLayers([]);
    }
  }, [weatherData, activeLayers.weather]);

  // Generate terrain features
  useEffect(() => {
    if (terrainData && activeLayers.terrain) {
      const features: TerrainFeature[] = [];
      
      // Generate random terrain features along the route
      const routeLength = 10; // number of features
      for (let i = 0; i < routeLength; i++) {
        const progress = i / (routeLength - 1);
        const lat = origin.lat + (destination.lat - origin.lat) * progress;
        const lon = origin.lon + (destination.lon - origin.lon) * progress;
        
        // Add some randomness to positions
        const randomLat = lat + (Math.random() - 0.5) * 2;
        const randomLon = lon + (Math.random() - 0.5) * 2;
        
        const featureTypes: TerrainFeature['type'][] = ['mountain', 'valley', 'plateau', 'coast'];
        const randomType = featureTypes[Math.floor(Math.random() * featureTypes.length)];
        
        features.push({
          id: `terrain-${i}`,
          type: randomType,
          position: { lat: randomLat, lon: randomLon },
          elevation: Math.random() * 5000 + 1000, // 1000-6000m
          size: Math.random() * 50 + 10 // 10-60km
        });
      }
      
      setTerrainFeatures(features);
    } else {
      setTerrainFeatures([]);
    }
  }, [terrainData, activeLayers.terrain, origin, destination]);

  // Get time of day styling
  const getTimeOfDayStyle = () => {
    switch (timeOfDay) {
      case 'dawn':
        return {
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
          textColor: '#92400e'
        };
      case 'day':
        return {
          background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)',
          textColor: '#1e40af'
        };
      case 'dusk':
        return {
          background: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 50%, #ea580c 100%)',
          textColor: '#9a3412'
        };
      case 'night':
        return {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          textColor: '#e2e8f0'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)',
          textColor: '#1e40af'
        };
    }
  };

  const timeStyle = getTimeOfDayStyle();

  // Toggle layer visibility
  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Get terrain feature icon
  const getTerrainIcon = (type: TerrainFeature['type']): string => {
    switch (type) {
      case 'mountain': return '🏔️';
      case 'valley': return '🏞️';
      case 'plateau': return '⛰️';
      case 'coast': return '🏖️';
      default: return '📍';
    }
  };

  // Get terrain feature color
  const getTerrainColor = (type: TerrainFeature['type']): string => {
    switch (type) {
      case 'mountain': return 'text-gray-800 bg-gray-200 dark:bg-gray-700';
      case 'valley': return 'text-green-800 bg-green-200 dark:bg-green-700';
      case 'plateau': return 'text-yellow-800 bg-yellow-200 dark:bg-yellow-700';
      case 'coast': return 'text-blue-800 bg-blue-200 dark:bg-blue-700';
      default: return 'text-gray-600 bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Time of Day Indicator */}
      {activeLayers.timeOfDay && (
        <div 
          className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          style={{ 
            background: timeStyle.background,
            color: timeStyle.textColor
          }}
        >
          <div className="flex items-center space-x-2">
            <span>
              {timeOfDay === 'dawn' && '🌅'}
              {timeOfDay === 'day' && '☀️'}
              {timeOfDay === 'dusk' && '🌇'}
              {timeOfDay === 'night' && '🌙'}
            </span>
            <span className="capitalize">{timeOfDay}</span>
          </div>
        </div>
      )}

      {/* Weather Overlay */}
      {activeLayers.weather && weatherLayers.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {weatherLayers.map(layer => (
            <div
              key={layer.id}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${layer.color} ${layer.intensity * 100}%, transparent ${layer.intensity * 100 + 20}%)`,
                opacity: layer.opacity
              }}
            />
          ))}
          
          {/* Weather Legend */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Weather</h4>
            <div className="space-y-1 text-xs">
              {weatherLayers.map(layer => (
                <div key={layer.id} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layer.color, opacity: layer.opacity }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {layer.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terrain Overlay */}
      {activeLayers.terrain && terrainFeatures.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {terrainFeatures.map(feature => (
            <div
              key={feature.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${((feature.position.lon + 180) / 360) * 100}%`,
                top: `${((90 - feature.position.lat) / 180) * 100}%`
              }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-lg ${getTerrainColor(feature.type)}`}>
                {getTerrainIcon(feature.type)}
              </div>
              
              {/* Feature Label */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white shadow-lg whitespace-nowrap">
                {feature.type}
              </div>
            </div>
          ))}
          
          {/* Terrain Legend */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Terrain</h4>
            <div className="space-y-1 text-xs">
              {['mountain', 'valley', 'plateau', 'coast'].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${getTerrainColor(type as TerrainFeature['type'])}`}>
                    {getTerrainIcon(type as TerrainFeature['type'])}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Elevation Profile */}
      {activeLayers.elevation && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Elevation</h4>
          <div className="w-32 h-16 bg-gray-100 dark:bg-gray-700 rounded relative overflow-hidden">
            {/* Simplified elevation profile */}
            <svg className="w-full h-full" viewBox="0 0 128 64">
              <path
                d="M0,60 Q32,40 64,50 T128,30"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d="M0,60 Q32,40 64,50 T128,30 L128,64 L0,64 Z"
                fill="url(#elevationGradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Route elevation profile
          </div>
        </div>
      )}

      {/* Layer Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {Object.entries(activeLayers).map(([layer, isActive]) => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer as keyof typeof activeLayers)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {layer === 'weather' && '🌤️'}
              {layer === 'terrain' && '🏔️'}
              {layer === 'elevation' && '📊'}
              {layer === 'timeOfDay' && '🕐'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}



