'use client';

import { useState, useEffect, useCallback } from 'react';

interface MapLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'flight' | 'weather' | 'terrain' | 'analysis' | 'overlay';
  enabled: boolean;
  opacity: number;
  zIndex: number;
  data?: any;
}

interface EnhancedMapLayersProps {
  onLayerToggle: (layerId: string, enabled: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerOrderChange: (layerId: string, direction: 'up' | 'down') => void;
  className?: string;
}

export function EnhancedMapLayers({
  onLayerToggle,
  onLayerOpacityChange,
  onLayerOrderChange,
  className = ''
}: EnhancedMapLayersProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'settings' | 'presets'>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define available map layers
  const [layers, setLayers] = useState<MapLayer[]>([
    // Flight-related layers
    {
      id: 'flight-route',
      name: 'Flight Route',
      description: 'Main flight path with waypoints',
      icon: '✈️',
      category: 'flight',
      enabled: true,
      opacity: 1.0,
      zIndex: 100
    },
    {
      id: 'sun-ray',
      name: 'Sun Ray',
      description: 'Sun position and azimuth visualization',
      icon: '☀️',
      category: 'flight',
      enabled: true,
      opacity: 0.8,
      zIndex: 90
    },
    {
      id: 'waypoints',
      name: 'Waypoints',
      description: 'Flight waypoints and checkpoints',
      icon: '📍',
      category: 'flight',
      enabled: true,
      opacity: 1.0,
      zIndex: 110
    },
    {
      id: 'flight-progress',
      name: 'Flight Progress',
      description: 'Real-time flight progress indicator',
      icon: '🔄',
      category: 'flight',
      enabled: false,
      opacity: 0.9,
      zIndex: 95
    },

    // Weather layers
    {
      id: 'cloud-cover',
      name: 'Cloud Cover',
      description: 'Cloud coverage visualization',
      icon: '☁️',
      category: 'weather',
      enabled: false,
      opacity: 0.6,
      zIndex: 50
    },
    {
      id: 'visibility',
      name: 'Visibility',
      description: 'Atmospheric visibility conditions',
      icon: '👁️',
      category: 'weather',
      enabled: false,
      opacity: 0.7,
      zIndex: 55
    },
    {
      id: 'wind-patterns',
      name: 'Wind Patterns',
      description: 'Wind direction and speed',
      icon: '💨',
      category: 'weather',
      enabled: false,
      opacity: 0.5,
      zIndex: 45
    },

    // Terrain layers
    {
      id: 'elevation',
      name: 'Elevation',
      description: 'Terrain elevation data',
      icon: '🏔️',
      category: 'terrain',
      enabled: false,
      opacity: 0.8,
      zIndex: 30
    },
    {
      id: 'terrain-features',
      name: 'Terrain Features',
      description: 'Mountains, valleys, and landmarks',
      icon: '🗻',
      category: 'terrain',
      enabled: false,
      opacity: 0.7,
      zIndex: 35
    },
    {
      id: 'water-bodies',
      name: 'Water Bodies',
      description: 'Lakes, rivers, and oceans',
      icon: '🌊',
      category: 'terrain',
      enabled: false,
      opacity: 0.6,
      zIndex: 40
    },

    // Analysis layers
    {
      id: 'solar-analysis',
      name: 'Solar Analysis',
      description: 'Sun position analysis and predictions',
      icon: '🔍',
      category: 'analysis',
      enabled: false,
      opacity: 0.9,
      zIndex: 80
    },
    {
      id: 'flight-optimization',
      name: 'Flight Optimization',
      description: 'Optimal route suggestions',
      icon: '🎯',
      category: 'analysis',
      enabled: false,
      opacity: 0.8,
      zIndex: 85
    },
    {
      id: 'time-analysis',
      name: 'Time Analysis',
      description: 'Time-based flight analysis',
      icon: '⏰',
      category: 'analysis',
      enabled: false,
      opacity: 0.7,
      zIndex: 75
    },

    // Overlay layers
    {
      id: 'grid-lines',
      name: 'Grid Lines',
      description: 'Geographic coordinate grid',
      icon: '📐',
      category: 'overlay',
      enabled: false,
      opacity: 0.4,
      zIndex: 20
    },
    {
      id: 'scale-bar',
      name: 'Scale Bar',
      description: 'Map scale indicator',
      icon: '📏',
      category: 'overlay',
      enabled: true,
      opacity: 1.0,
      zIndex: 25
    },
    {
      id: 'compass-rose',
      name: 'Compass Rose',
      description: 'Direction indicator',
      icon: '🧭',
      category: 'overlay',
      enabled: false,
      opacity: 0.8,
      zIndex: 15
    }
  ]);

  // Filter layers based on search and category
  const filteredLayers = layers.filter(layer => {
    const matchesSearch = layer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         layer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || layer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category icon
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'flight': return '✈️';
      case 'weather': return '🌤️';
      case 'terrain': return '🏔️';
      case 'analysis': return '🔍';
      case 'overlay': return '📋';
      default: return '🔧';
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'flight': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
      case 'weather': return 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300';
      case 'terrain': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
      case 'analysis': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
      case 'overlay': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  // Handle layer toggle
  const handleLayerToggle = useCallback((layerId: string, enabled: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, enabled } : layer
    ));
    onLayerToggle(layerId, enabled);
  }, [onLayerToggle]);

  // Handle opacity change
  const handleOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
    onLayerOpacityChange(layerId, opacity);
  }, [onLayerOpacityChange]);

  // Handle layer reordering
  const handleLayerReorder = useCallback((layerId: string, direction: 'up' | 'down') => {
    setLayers(prev => {
      const currentIndex = prev.findIndex(layer => layer.id === layerId);
      if (currentIndex === -1) return prev;

      const newLayers = [...prev];
      if (direction === 'up' && currentIndex > 0) {
        [newLayers[currentIndex], newLayers[currentIndex - 1]] = 
        [newLayers[currentIndex - 1], newLayers[currentIndex]];
      } else if (direction === 'down' && currentIndex < newLayers.length - 1) {
        [newLayers[currentIndex], newLayers[currentIndex + 1]] = 
        [newLayers[currentIndex + 1], newLayers[currentIndex]];
      }

      // Update z-index values
      newLayers.forEach((layer, index) => {
        layer.zIndex = 1000 - index * 10;
      });

      return newLayers;
    });
    onLayerOrderChange(layerId, direction);
  }, [onLayerOrderChange]);

  // Layer presets
  const layerPresets = [
    {
      name: 'Flight Essentials',
      description: 'Core flight visualization layers',
      layers: ['flight-route', 'sun-ray', 'waypoints', 'scale-bar']
    },
    {
      name: 'Weather Analysis',
      description: 'Complete weather visualization',
      layers: ['cloud-cover', 'visibility', 'wind-patterns']
    },
    {
      name: 'Terrain Explorer',
      description: 'Full terrain visualization',
      layers: ['elevation', 'terrain-features', 'water-bodies']
    },
    {
      name: 'Full Analysis',
      description: 'All analysis and overlay layers',
      layers: ['solar-analysis', 'flight-optimization', 'time-analysis', 'grid-lines', 'compass-rose']
    }
  ];

  // Apply preset
  const applyPreset = useCallback((preset: typeof layerPresets[0]) => {
    setLayers(prev => prev.map(layer => ({
      ...layer,
      enabled: preset.layers.includes(layer.id)
    })));
    
    // Notify parent component
    preset.layers.forEach(layerId => {
      onLayerToggle(layerId, true);
    });
  }, [onLayerToggle]);

  // Get layer statistics
  const layerStats = {
    total: layers.length,
    enabled: layers.filter(l => l.enabled).length,
    byCategory: layers.reduce((acc, layer) => {
      acc[layer.category] = (acc[layer.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className={`fixed bottom-4 right-20 z-50 ${className}`}>
      {/* Layer Management Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-indigo-600 text-white border-indigo-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
        }`}
        title="Enhanced Map Layers"
      >
        🗺️
      </button>

      {/* Layer Management Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enhanced Map Layers</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{layerStats.enabled}/{layerStats.total}</span>
                <span className="text-xs">layers active</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'layers', label: 'Layers', icon: '🗺️' },
              { id: 'presets', label: 'Presets', icon: '⚡' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-600'
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
            {activeTab === 'layers' && (
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search layers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {['all', 'flight', 'weather', 'terrain', 'analysis', 'overlay'].map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer List */}
                <div className="space-y-2">
                  {filteredLayers.map(layer => (
                    <div
                      key={layer.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      {/* Layer Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleLayerReorder(layer.id, 'up')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleLayerReorder(layer.id, 'down')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </div>

                      {/* Layer Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={layer.enabled}
                              onChange={(e) => handleLayerToggle(layer.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                          </label>
                          
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(layer.category)}`}>
                            {getCategoryIcon(layer.category)}
                          </span>
                        </div>

                        {/* Opacity Control */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Opacity</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layer.opacity}
                            onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                            {Math.round(layer.opacity * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Quick layer configurations for common use cases.
                </div>
                
                {layerPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{preset.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</div>
                      </div>
                      <button
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {preset.layers.map(layerId => {
                        const layer = layers.find(l => l.id === layerId);
                        return layer ? (
                          <span
                            key={layerId}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {layer.icon} {layer.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure layer management and visualization settings.
                </div>
                
                {/* Layer Statistics */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    📊 Layer Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <div>Total Layers: {layerStats.total}</div>
                    <div>Active Layers: {layerStats.enabled}</div>
                    {Object.entries(layerStats.byCategory).map(([category, count]) => (
                      <div key={category} className="col-span-2">
                        {category.charAt(0).toUpperCase() + category.slice(1)}: {count}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Settings */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    ⚡ Performance Settings
                  </h4>
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <div>• Auto-optimize layer rendering</div>
                    <div>• Smart layer culling</div>
                    <div>• Adaptive quality based on zoom</div>
                    <div>• Layer preloading for smooth transitions</div>
                  </div>
                </div>

                {/* Export/Import */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Export Config
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Import Config
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



