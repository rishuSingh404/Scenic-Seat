'use client';

import { useState, useRef, useEffect } from 'react';
import { City } from '@/lib/cities';

interface MapOverlayProps {
  origin: City;
  destination: City;
  currentTime: string;
  isVisible: boolean;
  onWaypointClick: (waypoint: any) => void;
  onMeasurementComplete: (distance: number, bearing: number) => void;
  className?: string;
}

interface Waypoint {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: 'origin' | 'destination' | 'midpoint' | 'checkpoint';
  altitude?: number;
  time?: string;
  description?: string;
}

export function InteractiveMapOverlay({
  origin,
  destination,
  currentTime,
  isVisible,
  onWaypointClick,
  onMeasurementComplete,
  className = ''
}: MapOverlayProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<{ lat: number; lon: number }[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Generate waypoints when cities change
  useEffect(() => {
    if (origin && destination) {
      const newWaypoints: Waypoint[] = [
        {
          id: 'origin',
          lat: origin.lat,
          lon: origin.lon,
          name: origin.name,
          type: 'origin',
          description: 'Departure city'
        },
        {
          id: 'midpoint',
          lat: (origin.lat + destination.lat) / 2,
          lon: (origin.lon + destination.lon) / 2,
          name: 'Midpoint',
          type: 'midpoint',
          description: 'Route midpoint'
        },
        {
          id: 'destination',
          lat: destination.lat,
          lon: destination.lon,
          name: destination.name,
          type: 'destination',
          description: 'Arrival city'
        }
      ];
      setWaypoints(newWaypoints);
    }
  }, [origin, destination]);

  // Calculate great circle distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
  };

  const handleWaypointClick = (waypoint: Waypoint, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedWaypoint(waypoint);
    onWaypointClick(waypoint);
    
    // Show tooltip
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
    
    // Hide tooltip after 3 seconds
    setTimeout(() => setShowTooltip(false), 3000);
  };

  const handleMapClick = (event: React.MouseEvent) => {
    if (!isMeasuring) return;
    
    // Get click coordinates (simplified - in real implementation, convert screen to map coordinates)
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to lat/lon (simplified conversion)
    const lat = 90 - (y / rect.height) * 180;
    const lon = (x / rect.width) * 360 - 180;
    
    const newPoint = { lat, lon };
    setMeasurementPoints(prev => [...prev, newPoint]);
    
    // If we have 2 points, calculate and complete measurement
    if (measurementPoints.length === 1) {
      const distance = calculateDistance(
        measurementPoints[0].lat, measurementPoints[0].lon,
        newPoint.lat, newPoint.lon
      );
      const bearing = calculateBearing(
        measurementPoints[0].lat, measurementPoints[0].lon,
        newPoint.lat, newPoint.lon
      );
      
      onMeasurementComplete(distance, bearing);
      setIsMeasuring(false);
      setMeasurementPoints([]);
    }
  };

  const startMeasurement = () => {
    setIsMeasuring(true);
    setMeasurementPoints([]);
  };

  const cancelMeasurement = () => {
    setIsMeasuring(false);
    setMeasurementPoints([]);
  };

  const getWaypointIcon = (type: Waypoint['type']): string => {
    switch (type) {
      case 'origin': return '🛫';
      case 'destination': return '🛬';
      case 'midpoint': return '📍';
      case 'checkpoint': return '🎯';
      default: return '📍';
    }
  };

  const getWaypointColor = (type: Waypoint['type']): string => {
    switch (type) {
      case 'origin': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50';
      case 'destination': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'midpoint': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/50';
      case 'checkpoint': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={overlayRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      onClick={handleMapClick}
    >
      {/* Waypoints */}
      {waypoints.map((waypoint) => (
        <div
          key={waypoint.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-110 ${
            selectedWaypoint?.id === waypoint.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
          style={{
            left: `${((waypoint.lon + 180) / 360) * 100}%`,
            top: `${((90 - waypoint.lat) / 180) * 100}%`
          }}
          onClick={(e) => handleWaypointClick(waypoint, e)}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg ${getWaypointColor(waypoint.type)}`}>
            {getWaypointIcon(waypoint.type)}
          </div>
          
          {/* Waypoint Label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-medium text-gray-900 dark:text-white shadow-lg whitespace-nowrap">
            {waypoint.name}
          </div>
        </div>
      ))}

      {/* Measurement Points */}
      {measurementPoints.map((point, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{
            left: `${((point.lon + 180) / 360) * 100}%`,
            top: `${((90 - point.lat) / 180) * 100}%`
          }}
        >
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          {index === 0 && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded text-xs font-medium text-red-700 dark:text-red-300">
              Start
            </div>
          )}
        </div>
      ))}

      {/* Measurement Line */}
      {measurementPoints.length === 2 && (
        <svg className="absolute inset-0 pointer-events-none">
          <line
            x1={`${((measurementPoints[0].lon + 180) / 360) * 100}%`}
            y1={`${((90 - measurementPoints[0].lat) / 180) * 100}%`}
            x2={`${((measurementPoints[1].lon + 180) / 360) * 100}%`}
            y2={`${((90 - measurementPoints[1].lat) / 180) * 100}%`}
            stroke="red"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )}

      {/* Measurement Controls */}
      {isMeasuring && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Click to place measurement points
          </div>
          <div className="flex space-x-2">
            <button
              onClick={cancelMeasurement}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && selectedWaypoint && (
        <div
          className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getWaypointIcon(selectedWaypoint.type)}</span>
            <span className="font-medium text-gray-900 dark:text-white">{selectedWaypoint.name}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {selectedWaypoint.description}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Lat: {selectedWaypoint.lat.toFixed(4)}°<br />
            Lon: {selectedWaypoint.lon.toFixed(4)}°
          </div>
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={startMeasurement}
            disabled={isMeasuring}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMeasuring
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
            }`}
          >
            📏 Measure
          </button>
          
          <button
            onClick={() => setSelectedWaypoint(null)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      </div>
    </div>
  );
}



