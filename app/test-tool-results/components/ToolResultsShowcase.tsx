'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ToolResultCard from '../../../components/tool-results/ToolResultCard';
import { mockToolResults, generateMockResult, type MockToolResult } from './MockDataProvider';

// Mock visualization components for testing
const MockVisualization = ({ type, data }: { type: string; data: unknown }) => {
  switch (type) {
    case 'molecule3d':
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🧬</div>
            <p className="text-sm text-gray-300">3D Molecule Viewer</p>
            <p className="text-xs text-gray-400">{(data as { identifier?: string })?.identifier || 'Loading...'}</p>
          </div>
        </div>
      );
    
    case 'plotly':
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-gray-300">Interactive Chart</p>
            <p className="text-xs text-gray-400">Plotly Visualization</p>
          </div>
        </div>
      );
    
    case 'ocr':
      return (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-white mb-2">Extracted Text</h4>
            <div className="bg-gray-900/50 rounded p-3 text-sm text-gray-300">
              {(data as { extractedText?: string })?.extractedText || 'No text extracted'}
            </div>
          </div>
          {(data as { confidence?: number })?.confidence && (
            <div className="text-xs text-gray-400">
              Confidence: {((data as { confidence: number }).confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      );
    
    case 'physics':
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">⚛️</div>
            <p className="text-sm text-gray-300">Physics Simulation</p>
            <p className="text-xs text-gray-400">{(data as { simulationType?: string })?.simulationType || 'Loading...'}</p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🔧</div>
            <p className="text-sm text-gray-300">Unknown Tool</p>
          </div>
        </div>
      );
  }
};

export default function ToolResultsShowcase() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  // Group mock results by tool name and status
  const groupedResults = useMemo(() => {
    const groups: Record<string, MockToolResult[]> = {};
    
    mockToolResults.forEach((result, index) => {
      const key = `${result.toolName}-${result.status}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push({ ...result, id: `${key}-${index}` } as MockToolResult & { id: string });
    });
    
    return groups;
  }, []);

  const handleExpand = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const handleRetry = useCallback((cardId: string) => {
    setRetryCount(prev => ({
      ...prev,
      [cardId]: (prev[cardId] || 0) + 1
    }));
    console.log(`Retry attempted for ${cardId}, count: ${(retryCount[cardId] || 0) + 1}`);
  }, [retryCount]);

  const renderVisualization = useCallback((result: MockToolResult) => {
    if (!result.result) return null;

    switch (result.toolName) {
      case 'displayMolecule3D':
        return <MockVisualization type="molecule3d" data={result.result} />;
      case 'displayPlotlyChart':
        return <MockVisualization type="plotly" data={result.result} />;
      case 'performOCR':
        return <MockVisualization type="ocr" data={result.result} />;
      case 'displayPhysicsSimulation':
        return <MockVisualization type="physics" data={result.result} />;
      default:
        return <MockVisualization type="unknown" data={result.result} />;
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tool Results Showcase</h2>
        <p className="text-gray-400">
          Testing all tool result states and variations
        </p>
      </div>

      {/* Status Categories */}
      {['success', 'loading', 'error', 'partial'].map(status => (
        <div key={status} className="space-y-4">
          <h3 className="text-xl font-semibold text-white capitalize flex items-center space-x-2">
            <span>{status === 'success' ? '✅' : status === 'loading' ? '⏳' : status === 'error' ? '❌' : '⏸️'}</span>
            <span>{status} States</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedResults)
              .filter(([key]) => key.includes(`-${status}`))
              .map(([, results]) => 
                results.map((result) => {
                  const cardId = (result as MockToolResult & { id: string }).id;
                  return (
                    <ToolResultCard
                      key={cardId}
                      toolName={result.toolName}
                      status={result.status}
                      result={result.result}
                      error={result.error}
                      metadata={result.metadata}
                      onRetry={() => handleRetry(cardId)}
                      onExpand={() => handleExpand(cardId)}
                      isExpanded={expandedCards.has(cardId)}
                    >
                      {renderVisualization(result)}
                    </ToolResultCard>
                  );
                })
              )}
          </div>
        </div>
      ))}

      {/* Performance Test Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <span>⚡</span>
          <span>Performance Tests</span>
        </h3>
        
        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const start = performance.now();
                // Simulate rendering 10 tool results
                for (let i = 0; i < 10; i++) {
                  generateMockResult('displayMolecule3D', 'success');
                }
                const end = performance.now();
                console.log(`Rendered 10 components in ${(end - start).toFixed(2)}ms`);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Render Speed Test
            </button>
            
            <button
              onClick={() => {
                // Memory usage test
                const memoryAPI = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
                const before = memoryAPI?.usedJSHeapSize || 0;
                // Generate mock results to test memory usage
                Array.from({ length: 50 }, () => 
                  generateMockResult('displayPlotlyChart', 'success')
                );
                setTimeout(() => {
                  const after = memoryAPI?.usedJSHeapSize || 0;
                  console.log(`Memory usage: ${((after - before) / 1024 / 1024).toFixed(2)}MB for 50 components`);
                }, 100);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Memory Test
            </button>
            
            <button
              onClick={() => {
                // Stress test with rapid state changes
                let count = 0;
                const interval = setInterval(() => {
                  const randomStatus = ['loading', 'success', 'error', 'partial'][Math.floor(Math.random() * 4)] as MockToolResult['status'];
                  generateMockResult('performOCR', randomStatus);
                  count++;
                  if (count >= 20) {
                    clearInterval(interval);
                    console.log('Stress test completed: 20 rapid state changes');
                  }
                }, 50);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Stress Test
            </button>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/30">
        <h4 className="text-sm font-semibold text-white mb-2">Debug Information</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Total tool results: {mockToolResults.length}</p>
          <p>Expanded cards: {expandedCards.size}</p>
          <p>Retry attempts: {Object.values(retryCount).reduce((a, b) => a + b, 0)}</p>
          <p>Performance monitoring: Active</p>
        </div>
      </div>
    </div>
  );
} 