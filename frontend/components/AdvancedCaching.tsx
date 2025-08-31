'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

interface AdvancedCachingProps {
  maxSize?: number; // Maximum cache size in MB
  defaultTTL?: number; // Default time to live in milliseconds
  className?: string;
}

export function AdvancedCaching({
  maxSize = 50, // 50MB default
  defaultTTL = 5 * 60 * 1000, // 5 minutes default
  className = ''
}: AdvancedCachingProps) {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'active'>('all');
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const statsRef = useRef<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0
  });

  // Initialize cache from localStorage
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('scenic-seat-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        const newCache = new Map();
        
        Object.entries(parsedCache).forEach(([key, entry]: [string, any]) => {
          // Check if entry is still valid
          if (Date.now() - entry.timestamp < entry.ttl) {
            newCache.set(key, entry);
          }
        });
        
        cacheRef.current = newCache;
        setCache(newCache);
        updateStats();
      }
    } catch (error) {
      console.warn('Failed to restore cache from localStorage:', error);
    }
  }, []);

  // Save cache to localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveCacheToStorage();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Cache management functions
  const setCacheEntry = useCallback(<T,>(key: string, data: T, ttl?: number): void => {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    const newCache = new Map(cacheRef.current);
    newCache.set(key, entry);
    
    // Check if we need to evict entries
    if (newCache.size > maxSize * 10) { // Rough estimate: 10 entries per MB
      evictOldestEntries(newCache);
    }

    cacheRef.current = newCache;
    setCache(newCache);
    updateStats();
  }, [defaultTTL, maxSize]);

  const getCacheEntry = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      updateStats(false); // Cache miss
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      setCache(new Map(cacheRef.current));
      updateStats(false); // Cache miss
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    updateStats(true); // Cache hit
    return entry.data;
  }, []);

  const deleteCacheEntry = useCallback((key: string): void => {
    const newCache = new Map(cacheRef.current);
    newCache.delete(key);
    cacheRef.current = newCache;
    setCache(newCache);
    updateStats();
  }, []);

  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
    setCache(new Map());
    updateStats();
  }, []);

  const evictOldestEntries = useCallback((cacheMap: Map<string, CacheEntry>): void => {
    const entries = Array.from(cacheMap.entries());
    const sortedEntries = entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < entriesToRemove; i++) {
      cacheMap.delete(sortedEntries[i][0]);
    }
    
    statsRef.current.evictions += entriesToRemove;
  }, []);

  const updateStats = useCallback((hit?: boolean): void => {
    const currentStats = statsRef.current;
    
    if (hit !== undefined) {
      if (hit) {
        currentStats.hitRate = (currentStats.hitRate * 0.9) + 0.1;
        currentStats.missRate = (currentStats.missRate * 0.9) + 0.0;
      } else {
        currentStats.hitRate = (currentStats.hitRate * 0.9) + 0.0;
        currentStats.missRate = (currentStats.missRate * 0.9) + 0.1;
      }
    }

    currentStats.totalEntries = cacheRef.current.size;
    currentStats.totalSize = Math.round(Array.from(cacheRef.current.values()).reduce((acc, entry) => {
      return acc + JSON.stringify(entry.data).length;
    }, 0) / 1024); // Size in KB

    setStats({ ...currentStats });
  }, []);

  const saveCacheToStorage = useCallback((): void => {
    try {
      const cacheObject: Record<string, CacheEntry> = {};
      cacheRef.current.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('scenic-seat-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }, []);

  // Filter cache entries
  const filteredEntries = Array.from(cache.values()).filter(entry => {
    const matchesSearch = entry.key.toLowerCase().includes(searchQuery.toLowerCase());
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    switch (filterType) {
      case 'expired':
        return matchesSearch && isExpired;
      case 'active':
        return matchesSearch && !isExpired;
      default:
        return matchesSearch;
    }
  });

  // Get cache entry status
  const getEntryStatus = (entry: CacheEntry): { status: string; color: string } => {
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    const age = Date.now() - entry.timestamp;
    const ttlPercentage = (age / entry.ttl) * 100;

    if (isExpired) {
      return { status: 'Expired', color: 'text-red-600' };
    } else if (ttlPercentage > 80) {
      return { status: 'Expiring Soon', color: 'text-yellow-600' };
    } else {
      return { status: 'Active', color: 'text-green-600' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Format TTL
  const formatTTL = (ttl: number): string => {
    const minutes = Math.floor(ttl / 60000);
    const seconds = Math.floor((ttl % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Cache Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-purple-600 text-white border-purple-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/50'
        }`}
        title="Advanced Caching"
      >
        💾
      </button>

      {/* Cache Panel */}
      {isVisible && (
        <div className="absolute bottom-16 left-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced Caching</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{stats.totalEntries} entries</span>
                <span className="text-xs">({stats.totalSize}KB)</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'entries', label: 'Entries', icon: '📝' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
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
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Cache Statistics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hit Rate</div>
                    <div className="text-lg font-semibold text-green-600">
                      {(stats.hitRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Miss Rate</div>
                    <div className="text-lg font-semibold text-red-600">
                      {(stats.missRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Entries</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {stats.totalEntries}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Evictions</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {stats.evictions}
                    </div>
                  </div>
                </div>

                {/* Cache Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={clearCache}
                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
                  >
                    Clear Cache
                  </button>
                  
                  <button
                    onClick={saveCacheToStorage}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                  >
                    Save to Storage
                  </button>
                </div>

                {/* Cache Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Cache Information
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• Max Size: {maxSize}MB</div>
                    <div>• Default TTL: {formatTTL(defaultTTL)}</div>
                    <div>• Current Size: {stats.totalSize}KB</div>
                    <div>• Auto-save: Every 30 seconds</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'entries' && (
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search cache keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <div className="flex space-x-2">
                    {['all', 'active', 'expired'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type as any)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          filterType === type
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cache Entries */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No cache entries found
                    </div>
                  ) : (
                    filteredEntries.map(entry => {
                      const status = getEntryStatus(entry);
                      return (
                        <div
                          key={entry.key}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {entry.key}
                            </div>
                            <button
                              onClick={() => deleteCacheEntry(entry.key)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Status:</span>
                              <span className={`ml-1 font-medium ${status.color}`}>
                                {status.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Accesses:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                {entry.accessCount}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created:</span>
                              <span className="ml-1 text-gray-600 dark:text-gray-300">
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">TTL:</span>
                              <span className="ml-1 text-gray-600 dark:text-gray-300">
                                {formatTTL(entry.ttl)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    ⚠️ Cache Settings
                  </h4>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <div>• Cache settings are configured at component level</div>
                    <div>• Max size: {maxSize}MB</div>
                    <div>• Default TTL: {formatTTL(defaultTTL)}</div>
                    <div>• Auto-eviction: Enabled</div>
                    <div>• Persistence: localStorage</div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Usage Examples
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• Cache API responses</div>
                    <div>• Store computed values</div>
                    <div>• Cache user preferences</div>
                    <div>• Store form data temporarily</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
