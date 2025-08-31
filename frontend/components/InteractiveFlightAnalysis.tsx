'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { City } from '@/lib/cities';

interface FlightAnalysisPoint {
  lat: number;
  lon: number;
  altitude: number;
  time: string;
  distance: number;
  bearing: number;
  sunAzimuth: number;
  relativeAngle: number;
  confidence: 'high' | 'medium' | 'low';
  side: 'left' | 'right' | 'either';
}

interface InteractiveFlightAnalysisProps {
  origin: City;
  destination: City;
  currentTime: string;
  flightPath: FlightAnalysisPoint[];
  onAnalysisUpdate: (analysis: any) => void;
  className?: string;
}

export function InteractiveFlightAnalysis({
  origin,
  destination,
  currentTime,
  flightPath,
  onAnalysisUpdate,
  className = ''
}: InteractiveFlightAnalysisProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'optimization'>('overview');
  const [selectedPoint, setSelectedPoint] = useState<FlightAnalysisPoint | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'real-time' | 'prediction' | 'historical'>('real-time');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  // Calculate flight statistics
  const flightStats = useMemo(() => {
    if (flightPath.length === 0) return null;

    const totalDistance = flightPath[flightPath.length - 1]?.distance || 0;
    const avgAltitude = flightPath.reduce((sum, point) => sum + point.altitude, 0) / flightPath.length;
    const highConfidencePoints = flightPath.filter(point => point.confidence === 'high').length;
    const confidencePercentage = (highConfidencePoints / flightPath.length) * 100;

    // Find optimal viewing points
    const optimalPoints = flightPath.filter(point => 
      point.confidence === 'high' && 
      Math.abs(point.relativeAngle) > 45 && 
      Math.abs(point.relativeAngle) < 135
    );

    // Calculate time-based analysis
    const timeAnalysis = flightPath.reduce((acc, point) => {
      const hour = new Date(point.time).getHours();
      if (hour >= 6 && hour <= 18) {
        acc.daytime++;
      } else {
        acc.nighttime++;
      }
      return acc;
    }, { daytime: 0, nighttime: 0 });

    return {
      totalDistance: Math.round(totalDistance),
      avgAltitude: Math.round(avgAltitude),
      confidencePercentage: Math.round(confidencePercentage),
      optimalPoints: optimalPoints.length,
      timeAnalysis,
      totalPoints: flightPath.length
    };
  }, [flightPath]);

  // Generate analysis insights
  const analysisInsights = useMemo(() => {
    if (!flightStats) return [];

    const insights = [];

    // Distance insights
    if (flightStats.totalDistance > 5000) {
      insights.push({
        type: 'info',
        message: 'Long-haul flight detected',
        description: 'Consider timezone changes and multiple optimal viewing periods',
        icon: '🌍'
      });
    }

    // Confidence insights
    if (flightStats.confidencePercentage < 70) {
      insights.push({
        type: 'warning',
        message: 'Low confidence in some segments',
        description: 'Weather conditions or polar routes may affect visibility',
        icon: '⚠️'
      });
    }

    // Optimal viewing insights
    if (flightStats.optimalPoints > 0) {
      insights.push({
        type: 'success',
        message: `${flightStats.optimalPoints} optimal viewing points`,
        description: 'Excellent conditions for scenic viewing',
        icon: '✨'
      });
    }

    // Time-based insights
    if (flightStats.timeAnalysis.daytime > flightStats.timeAnalysis.nighttime) {
      insights.push({
        type: 'info',
        message: 'Primarily daytime flight',
        description: 'Good visibility conditions expected',
        icon: '☀️'
      });
    }

    return insights;
  }, [flightStats]);

  // Handle point selection
  const handlePointSelect = useCallback((point: FlightAnalysisPoint) => {
    setSelectedPoint(point);
    onAnalysisUpdate({
      type: 'point-selected',
      data: point
    });
  }, [onAnalysisUpdate]);

  // Generate flight path visualization data
  const visualizationData = useMemo(() => {
    if (flightPath.length === 0) return null;

    return {
      path: flightPath.map(point => ({ lat: point.lat, lon: point.lon })),
      confidence: flightPath.map(point => ({
        lat: point.lat,
        lon: point.lon,
        confidence: point.confidence,
        side: point.side
      })),
      optimal: flightPath.filter(point => point.confidence === 'high' && 
        Math.abs(point.relativeAngle) > 45 && Math.abs(point.relativeAngle) < 135)
    };
  }, [flightPath]);

  // Get confidence color
  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get side indicator
  const getSideIndicator = (side: string): string => {
    switch (side) {
      case 'left': return '⬅️ Left';
      case 'right': return '➡️ Right';
      case 'either': return '↔️ Either';
      default: return '❓ Unknown';
    }
  };

  // Format time
  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format distance
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} km`;
    }
    return `${(distance / 1000).toFixed(1)}k km`;
  };

  return (
    <div className={`fixed bottom-4 right-36 z-50 ${className}`}>
      {/* Flight Analysis Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-orange-600 text-white border-orange-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/50'
        }`}
        title="Interactive Flight Analysis"
      >
        🔍
      </button>

      {/* Flight Analysis Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Flight Analysis</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{flightStats?.totalPoints || 0}</span>
                <span className="text-xs">points</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analysis', label: 'Analysis', icon: '🔬' },
              { id: 'optimization', label: 'Optimization', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-b-2 border-orange-600'
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
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Flight Statistics */}
                {flightStats && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Distance</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {flightStats.totalDistance} km
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Altitude</div>
                      <div className="text-lg font-semibold text-green-600">
                        {flightStats.avgAltitude} m
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {flightStats.confidencePercentage}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Optimal Points</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {flightStats.optimalPoints}
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Insights */}
                {analysisInsights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      💡 Analysis Insights
                    </h4>
                    <div className="space-y-2">
                      {analysisInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                            insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-lg">{insight.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">{insight.message}</div>
                              <div className="text-xs opacity-80">{insight.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visualization Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    🎨 Visualization Controls
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showHeatmap}
                        onChange={(e) => setShowHeatmap(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Show confidence heatmap</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showConfidenceBands}
                        onChange={(e) => setShowConfidenceBands(e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Show confidence bands</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                {/* Analysis Mode Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Analysis Mode</label>
                  <div className="flex space-x-2">
                    {['real-time', 'prediction', 'historical'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setAnalysisMode(mode as any)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          analysisMode === mode
                            ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flight Path Points */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📍 Flight Path Analysis
                  </h4>
                  
                  {flightPath.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No flight path data available
                    </div>
                  ) : (
                    flightPath.map((point, index) => (
                      <div
                        key={index}
                        onClick={() => handlePointSelect(point)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPoint === point
                            ? 'bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Point {index + 1}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(point.confidence)}`}>
                            {point.confidence.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Time:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                              {formatTime(point.time)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                              {formatDistance(point.distance)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Side:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                              {getSideIndicator(point.side)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Angle:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">
                              {Math.round(point.relativeAngle)}°
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Flight optimization recommendations and route improvements.
                </div>
                
                {/* Route Optimization */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🛣️ Route Optimization
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• Optimize for scenic viewing opportunities</div>
                    <div>• Minimize flight time while maximizing views</div>
                    <div>• Consider weather conditions and visibility</div>
                    <div>• Balance fuel efficiency with passenger experience</div>
                  </div>
                </div>

                {/* Viewing Recommendations */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    👁️ Viewing Recommendations
                  </h4>
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <div>• Best viewing: {flightStats?.optimalPoints || 0} optimal points</div>
                    <div>• Recommended seating: Based on flight direction</div>
                    <div>• Peak viewing times: Golden hour and sunrise/sunset</div>
                    <div>• Weather considerations: Clear skies preferred</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    📈 Performance Metrics
                  </h4>
                  <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <div>• Scenic score: {flightStats ? Math.round((flightStats.confidencePercentage / 100) * 10) : 0}/10</div>
                    <div>• Viewing opportunities: {flightStats?.optimalPoints || 0} points</div>
                    <div>• Route efficiency: {flightStats ? Math.round((flightStats.totalDistance / 1000) * 100) / 100 : 0} km</div>
                    <div>• Confidence level: {flightStats?.confidencePercentage || 0}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors">
                    Export Analysis
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors">
                    Share Route
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



