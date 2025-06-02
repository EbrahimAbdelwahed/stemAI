import React from 'react';
import ToolResultsShowcase from './components/ToolResultsShowcase';
import PerformanceMonitor from './components/PerformanceMonitor';

export default function ToolResultsTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Tool Results Showcase</h1>
          <p className="text-gray-300 mb-2">
            Interactive demonstration of tool result components with various states and content types.
          </p>
          <p className="text-green-400 text-sm">
            ✅ Fixed: Tool result cropping issue - molecular visualizations now use adaptive sizing
          </p>
        </div>
        
        <ToolResultsShowcase />
      </div>
    </div>
  );
} 