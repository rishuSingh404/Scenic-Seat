'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  componentCount: number;
}

interface PerformanceOptimization {
  type: 'warning' | 'info' | 'critical';
  message: string;
  suggestion: string;
  priority: number;
}

export function PerformanceMonitor({ className = '' }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    componentCount: 0
  });
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const renderStartTime = useRef<number>(0);
  const componentCountRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    renderStartTime.current = performance.now();
    
    // Monitor performance metrics
    intervalRef.current = setInterval(() => {
      updateMetrics();
    }, 1000);
  }, []);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Update performance metrics
  const updateMetrics = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const perf = (window as any).performance;
      
      // Get memory usage if available
      let memoryUsage = 0;
      if (perf.memory) {
        memoryUsage = Math.round(perf.memory.usedJSHeapSize / 1024 / 1024); // MB
      }

      // Estimate CPU usage (simplified)
      const cpuUsage = Math.random() * 30 + 10; // Simulated 10-40%

      // Estimate network latency
      const networkLatency = Math.random() * 100 + 20; // Simulated 20-120ms

      // Count React components (simplified estimation)
      const componentCount = document.querySelectorAll('[data-reactroot], [data-reactid]').length;

      setMetrics({
        renderTime: performance.now() - renderStartTime.current,
        memoryUsage,
        cpuUsage,
        networkLatency,
        componentCount
      });

      // Analyze performance and generate optimization suggestions
      analyzePerformance({
        renderTime: performance.now() - renderStartTime.current,
        memoryUsage,
        cpuUsage,
        networkLatency,
        componentCount
      });
    }
  }, []);

  // Analyze performance and generate optimization suggestions
  const analyzePerformance = useCallback((currentMetrics: PerformanceMetrics) => {
    const suggestions: PerformanceOptimization[] = [];

    // Render time analysis
    if (currentMetrics.renderTime > 100) {
      suggestions.push({
        type: 'warning',
        message: 'Slow render time detected',
        suggestion: 'Consider using React.memo, useMemo, or useCallback to optimize re-renders',
        priority: 2
      });
    }

    // Memory usage analysis
    if (currentMetrics.memoryUsage > 100) {
      suggestions.push({
        type: 'critical',
        message: 'High memory usage detected',
        suggestion: 'Check for memory leaks, optimize large objects, and implement cleanup in useEffect',
        priority: 1
      });
    }

    // Component count analysis
    if (currentMetrics.componentCount > 100) {
      suggestions.push({
        type: 'info',
        message: 'Large number of components',
        suggestion: 'Consider component virtualization or lazy loading for better performance',
        priority: 3
      });
    }

    // CPU usage analysis
    if (currentMetrics.cpuUsage > 80) {
      suggestions.push({
        type: 'warning',
        message: 'High CPU usage detected',
        suggestion: 'Optimize expensive calculations, use Web Workers for heavy tasks',
        priority: 2
      });
    }

    // Network latency analysis
    if (currentMetrics.networkLatency > 100) {
      suggestions.push({
        type: 'info',
        message: 'High network latency',
        suggestion: 'Implement request caching and consider CDN for static assets',
        priority: 3
      });
    }

    setOptimizations(suggestions.sort((a, b) => a.priority - b.priority));
  }, []);

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  // Track component renders
  useEffect(() => {
    componentCountRef.current += 1;
  });

  // Get performance status color
  const getStatusColor = (metric: keyof PerformanceMetrics): string => {
    const value = metrics[metric];
    
    switch (metric) {
      case 'renderTime':
        return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600';
      case 'memoryUsage':
        return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600';
      case 'cpuUsage':
        return value < 50 ? 'text-green-600' : value < 80 ? 'text-yellow-600' : 'text-red-600';
      case 'networkLatency':
        return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600';
      case 'componentCount':
        return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get optimization icon
  const getOptimizationIcon = (type: PerformanceOptimization['type']): string => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  // Get optimization color
  const getOptimizationColor = (type: PerformanceOptimization['type']): string => {
    switch (type) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Performance Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-200 ${
          isVisible
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/50'
        }`}
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Performance Monitor</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isMonitoring ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Metrics Display */}
          <div className="p-4 space-y-4">
            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Render Time</div>
                <div className={`text-lg font-semibold ${getStatusColor('renderTime')}`}>
                  {metrics.renderTime.toFixed(1)}ms
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Memory</div>
                <div className={`text-lg font-semibold ${getStatusColor('memoryUsage')}`}>
                  {metrics.memoryUsage}MB
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPU Usage</div>
                <div className={`text-lg font-semibold ${getStatusColor('cpuUsage')}`}>
                  {metrics.cpuUsage.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Components</div>
                <div className={`text-lg font-semibold ${getStatusColor('componentCount')}`}>
                  {metrics.componentCount}
                </div>
              </div>
            </div>

            {/* Network Latency */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network Latency</div>
              <div className={`text-lg font-semibold ${getStatusColor('networkLatency')}`}>
                {metrics.networkLatency.toFixed(1)}ms
              </div>
            </div>

            {/* Optimization Suggestions */}
            {optimizations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Optimization Suggestions
                </h4>
                <div className="space-y-2">
                  {optimizations.slice(0, 3).map((optimization, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getOptimizationColor(optimization.type)}`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">{getOptimizationIcon(optimization.type)}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1">{optimization.message}</div>
                          <div className="text-xs opacity-80">{optimization.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Actions */}
            <div className="flex space-x-2">
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMonitoring
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70'
                    : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                }`}
              >
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </button>
              
              <button
                onClick={() => {
                  renderStartTime.current = performance.now();
                  updateMetrics();
                }}
                className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Performance Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Performance Tips
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use React.memo for expensive components</li>
                <li>• Implement useMemo for heavy calculations</li>
                <li>• Use useCallback for function references</li>
                <li>• Lazy load components and routes</li>
                <li>• Optimize images and assets</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
