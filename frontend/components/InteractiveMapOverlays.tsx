'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'origin' | 'destination' | 'waypoint' | 'checkpoint';
  timestamp: string;
  distance: number;
  bearing: number;
  elevation?: number;
  weather?: string;
  notes?: string;
}

interface MeasurementPoint {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  label?: string;
}

interface InteractiveMapOverlaysProps {
  waypoints: Waypoint[];
  onWaypointAdd: (waypoint: Omit<Waypoint, 'id'>) => void;
  onWaypointUpdate: (id: string, updates: Partial<Waypoint>) => void;
  onWaypointDelete: (id: string) => void;
  onMeasurementStart: () => void;
  onMeasurementPoint: (point: Omit<MeasurementPoint, 'id'>) => void;
  onMeasurementComplete: () => void;
  className?: string;
}

export function InteractiveMapOverlays({
  waypoints,
  onWaypointAdd,
  onWaypointUpdate,
  onWaypointDelete,
  onMeasurementStart,
  onMeasurementPoint,
  onMeasurementComplete,
  className = ''
}: InteractiveMapOverlaysProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'waypoints' | 'measurements' | 'overlays'>('waypoints');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showElevation, setShowElevation] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showTimeInfo, setShowTimeInfo] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, visible: false, content: '' });
  const [hoveredWaypoint, setHoveredWaypoint] = useState<string | null>(null);
  const [newWaypointForm, setNewWaypointForm] = useState({
    name: '',
    type: 'waypoint' as Waypoint['type'],
    notes: ''
  });

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Waypoint types with icons and colors
  const waypointTypes = [
    { type: 'origin', label: 'Origin', icon: '🛫', color: 'bg-green-500' },
    { type: 'destination', label: 'Destination', icon: '🛬', color: 'bg-red-500' },
    { type: 'waypoint', label: 'Waypoint', icon: '📍', color: 'bg-blue-500' },
    { type: 'checkpoint', label: 'Checkpoint', icon: '✅', color: 'bg-purple-500' }
  ];

  // Get waypoint type info
  const getWaypointTypeInfo = (type: Waypoint['type']) => {
    return waypointTypes.find(t => t.type === type) || waypointTypes[2];
  };

  // Handle waypoint hover for tooltip
  const handleWaypointHover = useCallback((waypoint: Waypoint, event: React.MouseEvent) => {
    setHoveredWaypoint(waypoint.id);
    setTooltipPosition({
      x: event.clientX + 10,
      y: event.clientY - 10,
      visible: true,
      content: `
        <div class="font-semibold">${waypoint.name}</div>
        <div class="text-sm">${waypoint.type}</div>
        <div class="text-xs">${waypoint.timestamp}</div>
        ${waypoint.elevation ? `<div class="text-xs">Elevation: ${waypoint.elevation}m</div>` : ''}
        ${waypoint.weather ? `<div class="text-xs">Weather: ${waypoint.weather}</div>` : ''}
        ${waypoint.notes ? `<div class="text-xs">Notes: ${waypoint.notes}</div>` : ''}
      `
    });
  }, []);

  // Handle waypoint hover end
  const handleWaypointHoverEnd = useCallback(() => {
    setHoveredWaypoint(null);
    setTooltipPosition(prev => ({ ...prev, visible: false }));
  }, []);

  // Start measurement mode
  const startMeasurement = useCallback(() => {
    setIsMeasuring(true);
    setMeasurementPoints([]);
    onMeasurementStart();
  }, [onMeasurementStart]);

  // Complete measurement
  const completeMeasurement = useCallback(() => {
    setIsMeasuring(false);
    onMeasurementComplete();
  }, [onMeasurementComplete]);

  // Add new waypoint
  const addNewWaypoint = useCallback(() => {
    if (!newWaypointForm.name.trim()) return;
    
    const newWaypoint: Omit<Waypoint, 'id'> = {
      lat: 0, // Will be set by map click
      lng: 0, // Will be set by map click
      name: newWaypointForm.name,
      type: newWaypointForm.type,
      timestamp: new Date().toISOString(),
      distance: 0,
      bearing: 0,
      notes: newWaypointForm.notes
    };
    
    onWaypointAdd(newWaypoint);
    setNewWaypointForm({ name: '', type: 'waypoint', notes: '' });
  }, [newWaypointForm, onWaypointAdd]);

  // Calculate total distance
  const totalDistance = useMemo(() => {
    if (waypoints.length < 2) return 0;
    return waypoints.reduce((total, waypoint, index) => {
      if (index === 0) return 0;
      const prev = waypoints[index - 1];
      return total + waypoint.distance;
    }, 0);
  }, [waypoints]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    if (waypoints.length < 2) return 0;
    const start = new Date(waypoints[0].timestamp);
    const end = new Date(waypoints[waypoints.length - 1].timestamp);
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  }, [waypoints]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Interactive Overlays Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-purple-600 text-white border-purple-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
        }`}
        title="Interactive Map Overlays"
      >
        🎯
      </button>

      {/* Interactive Overlays Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Interactive Overlays</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{waypoints.length} waypoints</span>
                <span className="text-xs">|</span>
                <span className="text-sm">{totalDistance.toFixed(0)}km</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'waypoints', label: 'Waypoints', icon: '📍' },
              { id: 'measurements', label: 'Measurements', icon: '📏' },
              { id: 'overlays', label: 'Overlays', icon: '🎨' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'waypoints' && (
              <div className="space-y-4">
                {/* Add New Waypoint */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    ➕ Add New Waypoint
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Waypoint name"
                      value={newWaypointForm.name}
                      onChange={(e) => setNewWaypointForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newWaypointForm.type}
                      onChange={(e) => setNewWaypointForm(prev => ({ ...prev, type: e.target.value as Waypoint['type'] }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {waypointTypes.map(type => (
                        <option key={type.type} value={type.type}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Notes (optional)"
                      value={newWaypointForm.notes}
                      onChange={(e) => setNewWaypointForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      rows={2}
                    />
                    <button
                      onClick={addNewWaypoint}
                      disabled={!newWaypointForm.name.trim()}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Waypoint
                    </button>
                  </div>
                </div>

                {/* Waypoints List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📍 Current Waypoints
                  </h4>
                  {waypoints.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No waypoints added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {waypoints.map((waypoint, index) => {
                        const typeInfo = getWaypointTypeInfo(waypoint.type);
                        return (
                          <div
                            key={waypoint.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              selectedWaypoint?.id === waypoint.id
                                ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-purple-200 dark:hover:border-purple-500'
                            }`}
                            onClick={() => setSelectedWaypoint(waypoint)}
                            onMouseEnter={(e) => handleWaypointHover(waypoint, e)}
                            onMouseLeave={handleWaypointHoverEnd}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${typeInfo.color}`}></div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {waypoint.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {typeInfo.label} • {waypoint.timestamp}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {waypoint.distance.toFixed(0)}km
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {waypoint.bearing.toFixed(0)}°
                                </div>
                              </div>
                            </div>
                            {waypoint.notes && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                                {waypoint.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Waypoint Statistics */}
                {waypoints.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      📊 Route Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                      <div>Total Distance: {totalDistance.toFixed(1)}km</div>
                      <div>Total Duration: {totalDuration.toFixed(0)}min</div>
                      <div>Waypoints: {waypoints.length}</div>
                      <div>Avg Speed: {(totalDistance / (totalDuration / 60)).toFixed(0)}km/h</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'measurements' && (
              <div className="space-y-4">
                {/* Measurement Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    📏 Measurement Tools
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={startMeasurement}
                      disabled={isMeasuring}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isMeasuring
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isMeasuring ? 'Measuring...' : 'Start Measurement'}
                    </button>
                    {isMeasuring && (
                      <button
                        onClick={completeMeasurement}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Complete Measurement
                      </button>
                    )}
                  </div>
                </div>

                {/* Measurement Points */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📍 Measurement Points
                  </h4>
                  {measurementPoints.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {isMeasuring ? 'Click on map to add points' : 'No measurements yet'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {measurementPoints.map((point, index) => (
                        <div
                          key={point.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  Point {index + 1}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {point.timestamp}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                              {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                            </div>
                          </div>
                          {point.label && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                              {point.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Measurement Instructions */}
                {isMeasuring && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      💡 Instructions
                    </h4>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      <div>• Click on the map to add measurement points</div>
                      <div>• Points will be connected automatically</div>
                      <div>• Distance and bearing will be calculated</div>
                      <div>• Click "Complete" when finished</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overlays' && (
              <div className="space-y-4">
                {/* Overlay Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    🎨 Overlay Options
                  </h4>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Tooltips</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show hover information</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showTooltips}
                      onChange={(e) => setShowTooltips(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Elevation Data</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show height information</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showElevation}
                      onChange={(e) => setShowElevation(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Weather Info</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show weather conditions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showWeather}
                      onChange={(e) => setShowWeather(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Time Information</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show time details</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showTimeInfo}
                      onChange={(e) => setShowTimeInfo(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                </div>

                {/* Overlay Preview */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    👁️ Overlay Preview
                  </h4>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                    <div>• Hover over waypoints to see tooltips</div>
                    <div>• Click waypoints to select and edit</div>
                    <div>• Use measurement tools for distances</div>
                    <div>• Toggle overlays on/off as needed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltipPosition.visible && showTooltips && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none max-w-xs"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-100%)'
          }}
          dangerouslySetInnerHTML={{ __html: tooltipPosition.content }}
        />
      )}
    </div>
  );
}



