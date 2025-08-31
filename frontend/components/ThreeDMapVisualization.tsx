'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ThreeDMapVisualizationProps {
  onViewChange: (view: any) => void;
  onLayerToggle: (layerId: string, enabled: boolean) => void;
  className?: string;
}

interface ViewMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
}

export function ThreeDMapVisualization({
  onViewChange,
  onLayerToggle,
  className = ''
}: ThreeDMapVisualizationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'views' | 'layers' | 'controls'>('views');
  const [currentView, setCurrentView] = useState<string>('default');
  const [is3DMode, setIs3DMode] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showVegetation, setShowVegetation] = useState(false);
  const [cameraHeight, setCameraHeight] = useState(1000);
  const [cameraAngle, setCameraAngle] = useState(45);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('medium');

  // Available 3D view modes
  const viewModes: ViewMode[] = [
    {
      id: 'default',
      name: 'Default View',
      description: 'Standard 2D map view',
      icon: '🗺️',
      camera: {
        position: [0, 1000, 0],
        target: [0, 0, 0],
        fov: 60
      }
    },
    {
      id: 'birdseye',
      name: 'Bird\'s Eye',
      description: 'High-altitude overview',
      icon: '🦅',
      camera: {
        position: [0, 5000, 0],
        target: [0, 0, 0],
        fov: 45
      }
    },
    {
      id: 'street',
      name: 'Street Level',
      description: 'Ground-level perspective',
      icon: '🏙️',
      camera: {
        position: [0, 2, 0],
        target: [0, 2, 100],
        fov: 75
      }
    },
    {
      id: 'aerial',
      name: 'Aerial View',
      description: 'Low-altitude aerial perspective',
      icon: '✈️',
      camera: {
        position: [0, 500, 0],
        target: [0, 0, 100],
        fov: 60
      }
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Dramatic cinematic angles',
      icon: '🎬',
      camera: {
        position: [1000, 800, 1000],
        target: [0, 0, 0],
        fov: 50
      }
    },
    {
      id: 'orbit',
      name: 'Orbit Mode',
      description: 'Circular orbiting view',
      icon: '🔄',
      camera: {
        position: [1000, 500, 0],
        target: [0, 0, 0],
        fov: 55
      }
    }
  ];

  // 3D layer options
  const threeDLayers = [
    {
      id: 'terrain',
      name: '3D Terrain',
      description: 'Elevation and topography',
      icon: '🏔️',
      enabled: showTerrain,
      onToggle: setShowTerrain
    },
    {
      id: 'buildings',
      name: '3D Buildings',
      description: 'Urban structures and landmarks',
      icon: '🏢',
      enabled: showBuildings,
      onToggle: setShowBuildings
    },
    {
      id: 'water',
      name: '3D Water',
      description: 'Water bodies and effects',
      icon: '🌊',
      enabled: showWater,
      onToggle: setShowWater
    },
    {
      id: 'vegetation',
      name: '3D Vegetation',
      description: 'Trees, forests, and greenery',
      icon: '🌳',
      enabled: showVegetation,
      onToggle: setShowVegetation
    }
  ];

  // Handle view mode change
  const handleViewChange = useCallback((viewMode: ViewMode) => {
    setCurrentView(viewMode.id);
    setIs3DMode(viewMode.id !== 'default');
    onViewChange({
      type: 'view-change',
      data: viewMode
    });
  }, [onViewChange]);

  // Handle 3D mode toggle
  const handle3DModeToggle = useCallback((enabled: boolean) => {
    setIs3DMode(enabled);
    if (!enabled) {
      setCurrentView('default');
    }
    onViewChange({
      type: '3d-mode-toggle',
      data: { enabled }
    });
  }, [onViewChange]);

  // Handle camera controls
  const handleCameraChange = useCallback((type: 'height' | 'angle', value: number) => {
    if (type === 'height') {
      setCameraHeight(value);
    } else {
      setCameraAngle(value);
    }
    
    onViewChange({
      type: 'camera-change',
      data: { height: cameraHeight, angle: cameraAngle }
    });
  }, [cameraHeight, cameraAngle, onViewChange]);

  // Handle render quality change
  const handleQualityChange = useCallback((quality: 'low' | 'medium' | 'high') => {
    setRenderQuality(quality);
    onViewChange({
      type: 'quality-change',
      data: { quality }
    });
  }, [onViewChange]);

  // Get view mode icon
  const getViewModeIcon = (viewId: string): string => {
    const view = viewModes.find(v => v.id === viewId);
    return view ? view.icon : '🗺️';
  };

  // Get view mode color
  const getViewModeColor = (viewId: string): string => {
    return currentView === viewId
      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  // Get quality color
  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className={`fixed bottom-4 right-52 z-50 ${className}`}>
      {/* 3D Map Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-teal-600 text-white border-teal-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-teal-900/50'
        }`}
        title="3D Map Visualization"
      >
        🎯
      </button>

      {/* 3D Map Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">3D Map Visualization</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${is3DMode ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{is3DMode ? '3D Active' : '2D Mode'}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'views', label: 'Views', icon: '👁️' },
              { id: 'layers', label: 'Layers', icon: '🏗️' },
              { id: 'controls', label: 'Controls', icon: '🎛️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-b-2 border-teal-600'
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
            {activeTab === 'views' && (
              <div className="space-y-4">
                {/* 3D Mode Toggle */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">3D Mode</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Enable 3D visualization</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is3DMode}
                        onChange={(e) => handle3DModeToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>

                {/* View Modes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📐 View Modes
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {viewModes.map(viewMode => (
                      <button
                        key={viewMode.id}
                        onClick={() => handleViewChange(viewMode)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${getViewModeColor(viewMode.id)}`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{viewMode.icon}</div>
                          <div className="text-xs font-medium">{viewMode.name}</div>
                          <div className="text-xs opacity-75 mt-1">{viewMode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current View Info */}
                {currentView !== 'default' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      🎯 Current View: {viewModes.find(v => v.id === currentView)?.name}
                    </h4>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <div>• Camera Height: {cameraHeight}m</div>
                      <div>• Camera Angle: {cameraAngle}°</div>
                      <div>• Field of View: {viewModes.find(v => v.id === currentView)?.camera.fov}°</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Toggle 3D layers for enhanced visualization.
                </div>
                
                {/* 3D Layers */}
                <div className="space-y-2">
                  {threeDLayers.map(layer => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{layer.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {layer.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {layer.description}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layer.enabled}
                          onChange={(e) => {
                            layer.onToggle(e.target.checked);
                            onLayerToggle(layer.id, e.target.checked);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Layer Information */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    💡 3D Layer Benefits
                  </h4>
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <div>• Enhanced depth perception</div>
                    <div>• Realistic terrain visualization</div>
                    <div>• Immersive urban exploration</div>
                    <div>• Better spatial understanding</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Fine-tune 3D visualization settings and camera controls.
                </div>
                
                {/* Camera Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    📷 Camera Controls
                  </h4>
                  
                  {/* Camera Height */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Camera Height: {cameraHeight}m
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="10000"
                      step="100"
                      value={cameraHeight}
                      onChange={(e) => handleCameraChange('height', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>10m</span>
                      <span>5km</span>
                      <span>10km</span>
                    </div>
                  </div>

                  {/* Camera Angle */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Camera Angle: {cameraAngle}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={cameraAngle}
                      onChange={(e) => handleCameraChange('angle', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0° (Top)</span>
                      <span>45°</span>
                      <span>90° (Side)</span>
                    </div>
                  </div>
                </div>

                {/* Render Quality */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    ⚡ Render Quality
                  </h4>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high'] as const).map(quality => (
                      <button
                        key={quality}
                        onClick={() => handleQualityChange(quality)}
                        className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                          renderQuality === quality
                            ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Current: <span className={getQualityColor(renderQuality)}>{renderQuality.toUpperCase()}</span>
                  </div>
                </div>

                {/* Performance Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🚀 Performance Tips
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• Lower quality for better performance</div>
                    <div>• Reduce camera height for smoother rendering</div>
                    <div>• Disable unused 3D layers</div>
                    <div>• Use bird's eye view for large areas</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setCameraHeight(1000);
                      setCameraAngle(45);
                      setCurrentView('default');
                      setIs3DMode(false);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Reset View
                  </button>
                  <button
                    onClick={() => {
                      setRenderQuality('medium');
                      setShowTerrain(true);
                      setShowBuildings(false);
                      setShowWater(false);
                      setShowVegetation(false);
                    }}
                    className="flex-1 px-3 py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/70 transition-colors"
                  >
                    Optimize
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



