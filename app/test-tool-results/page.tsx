import React from 'react';
import ToolResultsShowcase from './components/ToolResultsShowcase';
import PerformanceMonitor from './components/PerformanceMonitor';

export default function ToolResultsTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">
            Tool Results Testing Environment
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Isolated development and testing environment for tool result components.
            Performance monitoring and visual regression testing enabled.
          </p>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Main Showcase */}
        <ToolResultsShowcase />

        {/* Test Controls */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              data-testid="render-all-tools"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Render All Tools
            </button>
            <button
              data-testid="clear-cache"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear Cache
            </button>
            <button
              data-testid="memory-test"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Memory Test
            </button>
            <button
              data-testid="performance-test"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Performance Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 