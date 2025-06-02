'use client';

import { ReactNode, useState } from 'react';

interface ToolResultContainerProps {
  children: ReactNode;
  toolName: string;
  thinkingTime?: number;
  error?: string;
}

export function ToolResultContainer({ 
  children, 
  toolName, 
  thinkingTime = 15,
  error
}: ToolResultContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const friendlyName = getFriendlyToolName(toolName);

  return (
    <div className="my-6">
      {/* Thinking Indicator */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[#8e8ea0] hover:text-white transition-colors text-sm"
        >
          <svg 
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Thought for {thinkingTime} seconds</span>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="bg-[#2f2f2f] border border-[#4d4d4d] rounded-xl p-6 shadow-lg">
          {error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm">Error executing {friendlyName}</p>
              <p className="text-[#8e8ea0] text-xs mt-2">{error}</p>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get friendly tool names
function getFriendlyToolName(toolName: string): string {
  const friendlyNames: Record<string, string> = {
    'displayMolecule3D': '3D Molecule Visualization',
    'displayPlotlyChart': 'Chart Visualization',
    'plotFunction2D': '2D Function Plot',
    'plotFunction3D': '3D Function Plot',
    'displayPhysicsSimulation': 'Physics Simulation',
    'performOCR': 'Text Recognition',
    'generateReactComponent': 'UI Component Generation',
    'searchDocuments': 'Document Search',
  };
  
  return friendlyNames[toolName] || toolName;
} 