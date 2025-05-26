'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  cacheHitRate: number;
  fps: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    cacheHitRate: 0,
    fps: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;
    let memoryInterval: NodeJS.Timeout;

    if (isMonitoring) {
      // FPS monitoring
      const measureFPS = () => {
        frameCountRef.current++;
        const now = performance.now();
        
        if (now - lastTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
          setMetrics(prev => ({ ...prev, fps }));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
        
        animationId = requestAnimationFrame(measureFPS);
      };
      
      measureFPS();

      // Memory monitoring
      memoryInterval = setInterval(() => {
        if ('memory' in performance) {
          const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
          if (memory) {
            const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
            setMetrics(prev => ({ ...prev, memoryUsage }));
          }
        }
      }, 1000);

      // Performance observer for render times
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const renderTimes = entries
            .filter(entry => entry.name.includes('tool-result'))
            .map(entry => entry.duration);
          
          if (renderTimes.length > 0) {
            const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
            setMetrics(prev => ({ ...prev, renderTime: Math.round(avgRenderTime * 100) / 100 }));
          }
        });
        
        observer.observe({ entryTypes: ['measure'] });
      }
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (memoryInterval) clearInterval(memoryInterval);
    };
  }, [isMonitoring]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-400';
    if (value <= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Performance Monitor</h2>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isMonitoring 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Render Time */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Render Time</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.renderTime, { good: 50, warning: 100 })}`}>
            {metrics.renderTime}ms
          </div>
          <div className="text-xs text-gray-500">Target: &lt;50ms</div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Memory</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { good: 3, warning: 5 })}`}>
            {metrics.memoryUsage}MB
          </div>
          <div className="text-xs text-gray-500">Target: &lt;3MB</div>
        </div>

        {/* FPS */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">FPS</div>
          <div className={`text-2xl font-bold ${getStatusColor(60 - metrics.fps, { good: 0, warning: 10 })}`}>
            {metrics.fps}
          </div>
          <div className="text-xs text-gray-500">Target: 60fps</div>
        </div>

        {/* Component Count */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Components</div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.componentCount}
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Cache Hit</div>
          <div className={`text-2xl font-bold ${getStatusColor(100 - metrics.cacheHitRate, { good: 10, warning: 20 })}`}>
            {metrics.cacheHitRate}%
          </div>
          <div className="text-xs text-gray-500">Target: &gt;90%</div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="mt-4 p-3 rounded-lg bg-gray-900/30">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            metrics.renderTime <= 50 && metrics.memoryUsage <= 3 && metrics.fps >= 55
              ? 'bg-green-400' 
              : metrics.renderTime <= 100 && metrics.memoryUsage <= 5 && metrics.fps >= 45
              ? 'bg-yellow-400'
              : 'bg-red-400'
          }`} />
          <span className="text-sm text-gray-300">
            {metrics.renderTime <= 50 && metrics.memoryUsage <= 3 && metrics.fps >= 55
              ? 'Performance: Excellent'
              : metrics.renderTime <= 100 && metrics.memoryUsage <= 5 && metrics.fps >= 45
              ? 'Performance: Good'
              : 'Performance: Needs Optimization'
            }
          </span>
        </div>
      </div>
    </div>
  );
} 