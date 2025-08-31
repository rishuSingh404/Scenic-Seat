'use client';

import { useState, useEffect, useCallback } from 'react';

interface AdvancedMapControlsProps {
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onTiltChange: (tilt: number) => void;
  onPitchChange: (pitch: number) => void;
  onBearingChange: (bearing: number) => void;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onStyleChange: (style: string) => void;
  onAnimationToggle: (enabled: boolean) => void;
  onMeasurementToggle: (enabled: boolean) => void;
  onFullscreenToggle: (enabled: boolean) => void;
  className?: string;
}

export function AdvancedMapControls({
  onZoomChange,
  onRotationChange,
  onTiltChange,
  onPitchChange,
  onBearingChange,
  onCenterChange,
  onStyleChange,
  onAnimationToggle,
  onMeasurementToggle,
  onFullscreenToggle,
  className = ''
}: AdvancedMapControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'navigation' | 'display' | 'tools'>('navigation');
  const [currentZoom, setCurrentZoom] = useState(10);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentTilt, setCurrentTilt] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [currentBearing, setCurrentBearing] = useState(0);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [measurementsEnabled, setMeasurementsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCompass, setShowCompass] = useState(true);
  const [showScale, setShowScale] = useState(true);

  // Map styles
  const mapStyles = [
    { id: 'streets', name: 'Streets', description: 'Standard street map', icon: '🏙️' },
    { id: 'satellite', name: 'Satellite', description: 'Satellite imagery', icon: '🛰️' },
    { id: 'terrain', name: 'Terrain', description: 'Topographic map', icon: '🏔️' },
    { id: 'hybrid', name: 'Hybrid', description: 'Satellite with labels', icon: '🌍' },
    { id: 'dark', name: 'Dark', description: 'Dark theme map', icon: '🌙' },
    { id: 'light', name: 'Light', description: 'Light theme map', icon: '☀️' }
  ];

  // Navigation presets
  const navigationPresets = [
    { name: 'North Up', rotation: 0, bearing: 0, icon: '⬆️' },
    { name: 'East Up', rotation: 90, bearing: 90, icon: '➡️' },
    { name: 'South Up', rotation: 180, bearing: 180, icon: '⬇️' },
    { name: 'West Up', rotation: 270, bearing: 270, icon: '⬅️' },
    { name: '45° Tilt', tilt: 45, pitch: 45, icon: '📐' },
    { name: 'Bird\'s Eye', tilt: 0, pitch: 0, icon: '🦅' }
  ];

  // Handle zoom change
  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
    onZoomChange(zoom);
  }, [onZoomChange]);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    setCurrentRotation(rotation);
    onRotationChange(rotation);
  }, [onRotationChange]);

  // Handle tilt change
  const handleTiltChange = useCallback((tilt: number) => {
    setCurrentTilt(tilt);
    onTiltChange(tilt);
  }, [onTiltChange]);

  // Handle pitch change
  const handlePitchChange = useCallback((pitch: number) => {
    setCurrentPitch(pitch);
    onPitchChange(pitch);
  }, [onPitchChange]);

  // Handle bearing change
  const handleBearingChange = useCallback((bearing: number) => {
    setCurrentBearing(bearing);
    onBearingChange(bearing);
  }, [onBearingChange]);

  // Handle style change
  const handleStyleChange = useCallback((style: string) => {
    setCurrentStyle(style);
    onStyleChange(style);
  }, [onStyleChange]);

  // Handle animation toggle
  const handleAnimationToggle = useCallback((enabled: boolean) => {
    setAnimationsEnabled(enabled);
    onAnimationToggle(enabled);
  }, [onAnimationToggle]);

  // Handle measurement toggle
  const handleMeasurementToggle = useCallback((enabled: boolean) => {
    setMeasurementsEnabled(enabled);
    onMeasurementToggle(enabled);
  }, [onMeasurementToggle]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback((enabled: boolean) => {
    setIsFullscreen(enabled);
    onFullscreenToggle(enabled);
  }, [onFullscreenToggle]);

  // Apply navigation preset
  const applyPreset = useCallback((preset: any) => {
    if (preset.rotation !== undefined) {
      handleRotationChange(preset.rotation);
    }
    if (preset.bearing !== undefined) {
      handleBearingChange(preset.bearing);
    }
    if (preset.tilt !== undefined) {
      handleTiltChange(preset.tilt);
    }
    if (preset.pitch !== undefined) {
      handlePitchChange(preset.pitch);
    }
  }, [handleRotationChange, handleBearingChange, handleTiltChange, handlePitchChange]);

  // Reset all controls
  const resetControls = useCallback(() => {
    handleZoomChange(10);
    handleRotationChange(0);
    handleTiltChange(0);
    handlePitchChange(0);
    handleBearingChange(0);
    handleStyleChange('streets');
    setShowGrid(false);
    setShowCompass(true);
    setShowScale(true);
  }, [handleZoomChange, handleRotationChange, handleTiltChange, handlePitchChange, handleBearingChange, handleStyleChange]);

  // Get style color
  const getStyleColor = (styleId: string): string => {
    return currentStyle === styleId
      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  return (
    <div className={`fixed bottom-4 right-68 z-50 ${className}`}>
      {/* Advanced Controls Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-red-600 text-white border-red-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/50'
        }`}
        title="Advanced Map Controls"
      >
        🎛️
      </button>

      {/* Advanced Controls Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced Map Controls</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Zoom: {currentZoom.toFixed(1)}</span>
                <span className="text-xs">|</span>
                <span className="text-sm">Rot: {currentRotation.toFixed(0)}°</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'navigation', label: 'Navigation', icon: '🧭' },
              { id: 'display', label: 'Display', icon: '🎨' },
              { id: 'tools', label: 'Tools', icon: '🔧' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-b-2 border-red-600'
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
            {activeTab === 'navigation' && (
              <div className="space-y-4">
                {/* Zoom Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    🔍 Zoom Level: {currentZoom.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={currentZoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1x</span>
                    <span>5x</span>
                    <span>10x</span>
                    <span>15x</span>
                    <span>20x</span>
                  </div>
                </div>

                {/* Rotation Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    🔄 Rotation: {currentRotation.toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={currentRotation}
                    onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                    <span>360°</span>
                  </div>
                </div>

                {/* Tilt Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    📐 Tilt: {currentTilt.toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={currentTilt}
                    onChange={(e) => handleTiltChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0° (Top)</span>
                    <span>30°</span>
                    <span>60°</span>
                  </div>
                </div>

                {/* Navigation Presets */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    ⚡ Quick Presets
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {navigationPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyPreset(preset)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="text-center">
                          <div className="text-sm mb-1">{preset.icon}</div>
                          <div className="text-xs">{preset.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetControls}
                  className="w-full px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                >
                  🔄 Reset All Controls
                </button>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-4">
                {/* Map Style Selection */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    🎨 Map Style
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {mapStyles.map(style => (
                      <button
                        key={style.id}
                        onClick={() => handleStyleChange(style.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${getStyleColor(style.id)}`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{style.icon}</div>
                          <div className="text-xs font-medium">{style.name}</div>
                          <div className="text-xs opacity-75 mt-1">{style.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📱 Display Options
                  </h4>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Grid Lines</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show coordinate grid</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Compass</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show direction indicator</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showCompass}
                      onChange={(e) => setShowCompass(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Scale Bar</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show distance scale</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showScale}
                      onChange={(e) => setShowScale(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>
                </div>

                {/* Animation Settings */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🎬 Animation Settings
                  </h4>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Smooth Transitions</span>
                    <input
                      type="checkbox"
                      checked={animationsEnabled}
                      onChange={(e) => handleAnimationToggle(e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Advanced map tools and utilities.
                </div>
                
                {/* Measurement Tools */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📏 Measurement Tools
                  </h4>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Distance Measurement</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Click to measure distances</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={measurementsEnabled}
                      onChange={(e) => handleMeasurementToggle(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>
                </div>

                {/* Fullscreen Control */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    🖥️ Display Control
                  </h4>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Fullscreen Mode</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Toggle fullscreen view</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isFullscreen}
                      onChange={(e) => handleFullscreenToggle(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </label>
                </div>

                {/* Advanced Tools */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    🚀 Advanced Tools
                  </h4>
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <div>• Coordinate display</div>
                    <div>• Elevation data</div>
                    <div>• Time zone overlay</div>
                    <div>• Weather integration</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    📍 Set Marker
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    📋 Copy Coordinates
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    🖼️ Screenshot
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    💾 Save View
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
