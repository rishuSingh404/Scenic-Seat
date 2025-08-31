'use client';

import React, { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RecommendationResponse } from '@/lib/schemas';

interface MapViewProps {
  recommendation: RecommendationResponse | null;
  originCity?: { name: string; lat: number; lon: number } | null;
  destinationCity?: { name: string; lat: number; lon: number } | null;
  animate?: boolean;
  layerConfig?: {
    'flight-route': { enabled: boolean; opacity: number };
    'sun-ray': { enabled: boolean; opacity: number };
    'waypoints': { enabled: boolean; opacity: number };
    'flight-progress': { enabled: boolean; opacity: number };
  };
}

interface MapViewRef {
  getMap: () => maplibregl.Map | null;
  updateTime: (newTime: string) => void;
  refresh: () => void;
  fitBounds: () => void;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView(props, ref) {
  const { recommendation, originCity, destinationCity, animate = false, layerConfig } = props;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose the map instance through the ref
  React.useImperativeHandle(ref, () => ({
    getMap: () => map.current,
    updateTime: (newTime: string) => {
        console.log('Updating map time to:', newTime);
      if (map.current && map.current.isStyleLoaded()) {
          map.current.triggerRepaint();
      }
    },
    refresh: () => {
      if (map.current && map.current.isStyleLoaded()) {
        map.current.triggerRepaint();
      }
    },
    fitBounds: () => {
        if (map.current && originCity && destinationCity) {
          const bounds = [
            [Math.min(originCity.lon, destinationCity.lon), Math.min(originCity.lat, destinationCity.lat)],
            [Math.max(originCity.lon, destinationCity.lon), Math.max(originCity.lat, destinationCity.lat)]
          ] as [[number, number], [number, number]];
          map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }));

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Create a simple map with basic styling
      const newMap = new maplibregl.Map({
      container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
      center: [0, 0],
        zoom: 2,
      attributionControl: false
    });

      map.current = newMap;

      newMap.on('load', () => {
        setIsLoaded(true);
        console.log('✅ Map loaded successfully');
      });

      newMap.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map');
      });

    } catch (err) {
      console.error('Failed to create map:', err);
      setError('Failed to create map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add flight path when cities change
  useEffect(() => {
    if (!isLoaded || !map.current || !originCity || !destinationCity) return;

    const currentMap = map.current;
    console.log('🔄 Adding flight path for:', originCity.name, '→', destinationCity.name);

    try {
      // Remove existing layers and sources
      if (currentMap.getLayer('flight-route-glow')) currentMap.removeLayer('flight-route-glow');
      if (currentMap.getLayer('flight-route')) currentMap.removeLayer('flight-route');
      if (currentMap.getLayer('origin-marker')) currentMap.removeLayer('origin-marker');
      if (currentMap.getLayer('destination-marker')) currentMap.removeLayer('destination-marker');
      if (currentMap.getSource('flight-route')) currentMap.removeSource('flight-route');
      if (currentMap.getSource('origin-marker')) currentMap.removeSource('origin-marker');
      if (currentMap.getSource('destination-marker')) currentMap.removeSource('destination-marker');

      // Create a simple great circle route (straight line for now)
      const routeCoordinates = [
        [originCity.lon, originCity.lat],
        [destinationCity.lon, destinationCity.lat]
      ];

      console.log('🌍 City coordinates:');
      console.log('   Origin:', originCity.name, 'at', originCity.lat, originCity.lon);
      console.log('   Destination:', destinationCity.name, 'at', destinationCity.lat, destinationCity.lon);
      console.log('   Route coordinates:', routeCoordinates);

      // Add flight route source and layer
      currentMap.addSource('flight-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      // Add flight route layer with high visibility
      currentMap.addLayer({
        id: 'flight-route',
        type: 'line',
        source: 'flight-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#ff0000', // Bright red for maximum visibility
          'line-width': 6, // Thicker line
          'line-opacity': 1.0, // Full opacity
          'line-dasharray': [8, 8] // Larger dashes
        }
      });

      console.log('🎯 Flight route coordinates:', routeCoordinates);
      console.log('🎯 Flight route layer added with ID: flight-route');

      // Add flight route glow effect for better visibility
      currentMap.addLayer({
        id: 'flight-route-glow',
        type: 'line',
        source: 'flight-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': '#ff6666',
          'line-width': 12, // Much thicker for glow
          'line-opacity': 0.3, // Semi-transparent
          'line-blur': 2
        }
      });

      // Add origin marker
      currentMap.addSource('origin-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [originCity.lon, originCity.lat]
          }
        }
      });

      currentMap.addLayer({
        id: 'origin-marker',
        type: 'circle',
        source: 'origin-marker',
        paint: {
          'circle-radius': 8,
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add destination marker
      currentMap.addSource('destination-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [destinationCity.lon, destinationCity.lat]
          }
        }
      });

      currentMap.addLayer({
        id: 'destination-marker',
        type: 'circle',
        source: 'destination-marker',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ef4444',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Fit map to show both cities
      const bounds = [
        [Math.min(originCity.lon, destinationCity.lon), Math.min(originCity.lat, destinationCity.lat)],
        [Math.max(originCity.lon, destinationCity.lon), Math.max(originCity.lat, destinationCity.lat)]
      ] as [[number, number], [number, number]];
      
      currentMap.fitBounds(bounds, { 
            padding: 100,
        duration: animate ? 1500 : 0
      });

      console.log('✅ Flight path added successfully');

    } catch (err) {
      console.error('Failed to add flight path:', err);
      setError('Failed to add flight path');
    }
  }, [isLoaded, originCity, destinationCity, animate]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center p-4">
            <div className="text-red-600 dark:text-red-400 mb-3">{error}</div>
            <button
              onClick={() => {
                setError(null);
                if (map.current && map.current.isStyleLoaded()) {
                  map.current.triggerRepaint();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* City labels overlay */}
      {isLoaded && originCity && destinationCity && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              {originCity.name}
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              {destinationCity.name}
            </div>
          </div>
      </div>
      )}
    </div>
  );
});