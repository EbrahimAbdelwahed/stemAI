'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ToolResultContainer } from './ToolResultContainer';
import { MoleculeVisualizationResult } from './MoleculeVisualizationResult';
import VisualizationErrorBoundary from '../visualizations/VisualizationErrorBoundary';
import OCRResult from '../OCRResult';
import CodePreview from '../CodePreview';
import { Typography } from '../ui/Typography';

// Dynamic imports for heavy components
const PlotlyPlotter = dynamic(() => import('../visualizations/PlotlyPlotter'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-8 text-[#8e8ea0]">Loading chart...</div>,
});

const MatterSimulator = dynamic(() => import('../visualizations/MatterSimulator'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-8 text-[#8e8ea0]">Loading simulation...</div>,
});

interface ToolResultRendererProps {
  toolInvocation: any;
  thinkingTime?: number;
}

export function ToolResultRenderer({ toolInvocation, thinkingTime = 15 }: ToolResultRendererProps) {
  const { toolCallId, toolName, state } = toolInvocation;
  const result = 'result' in toolInvocation ? toolInvocation.result : null;
  const error = 'error' in toolInvocation ? toolInvocation.error : null;

  // Don't render anything for loading states
  if (state === 'call' || state === 'partial-call') {
    return null;
  }

  // Handle errors
  if (error) {
    return (
      <ToolResultContainer
        toolName={toolName}
        thinkingTime={thinkingTime}
        error={typeof error === 'string' ? error : JSON.stringify(error)}
      >
        <div className="p-4 text-red-400 text-sm bg-red-900/10 rounded-lg">
          Error: {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      </ToolResultContainer>
    );
  }

  // No result to render
  if (!result) {
    return null;
  }

  // Render specific tool results
  const renderToolContent = () => {
    switch (toolName) {
      case 'displayMolecule3D':
        return <MoleculeVisualizationResult result={result} />;

      case 'displayPlotlyChart':
      case 'plotFunction2D':
      case 'plotFunction3D':
        return (
          <div className="bg-white p-4 rounded-lg">
            <PlotlyPlotter {...(result as any)} />
          </div>
        );

      case 'displayPhysicsSimulation':
        return (
          <div className="bg-white p-4 rounded-lg">
            <MatterSimulator {...(result as any)} />
          </div>
        );

      case 'performOCR':
        return <OCRResult {...(result as any)} />;

      case 'generateReactComponent':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <Typography variant="small" className="font-medium text-gray-800 mb-2">
                Generated Component Preview
              </Typography>
              {/* Component preview would go here */}
              <div className="text-gray-600 text-sm">
                Interactive component generated successfully
              </div>
            </div>
            {(result as any).code && (
              <div className="mt-4">
                <Typography variant="small" className="font-medium text-[#c5c5d2] mb-2">
                  Source Code
                </Typography>
                <CodePreview code={(result as any).code} />
              </div>
            )}
          </div>
        );

      case 'searchDocuments':
        return (
          <div className="space-y-4">
            <Typography variant="small" className="font-medium text-[#c5c5d2]">
              Document Search Results
            </Typography>
            {(result as any).documents?.map((doc: any, index: number) => (
              <div key={index} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#4d4d4d]">
                <Typography variant="small" className="font-medium text-white mb-1">
                  {doc.title || `Document ${index + 1}`}
                </Typography>
                <Typography variant="muted" className="text-[#8e8ea0] text-sm">
                  {doc.excerpt || doc.content?.substring(0, 200) + '...'}
                </Typography>
                {doc.relevanceScore && (
                  <div className="mt-2 text-xs text-[#8e8ea0]">
                    Relevance: {Math.round(doc.relevanceScore * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        // Fallback for unknown tools
        return (
          <div className="space-y-4">
            <Typography variant="small" className="text-[#8e8ea0] mb-2 font-medium">
              Tool: {toolName}
            </Typography>
            <CodePreview code={JSON.stringify(result, null, 2)} />
          </div>
        );
    }
  };

  return (
    <ToolResultContainer
      toolName={toolName}
      thinkingTime={thinkingTime}
    >
      <VisualizationErrorBoundary fallback={
        <div className="text-center py-4">
          <Typography variant="small" color="error">
            Error rendering tool output
          </Typography>
        </div>
      }>
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#8e8ea0] border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-[#8e8ea0]">Loading visualization...</span>
          </div>
        }>
          {renderToolContent()}
        </Suspense>
      </VisualizationErrorBoundary>
    </ToolResultContainer>
  );
}

// Helper to get friendly tool names
export function getFriendlyToolName(toolName: string): string {
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

// Helper to estimate thinking time based on tool complexity
export function estimateThinkingTime(toolName: string, result?: any): number {
  const baseTimes: Record<string, number> = {
    'displayMolecule3D': 25,
    'displayPlotlyChart': 20,
    'plotFunction2D': 18,
    'plotFunction3D': 30,
    'displayPhysicsSimulation': 35,
    'performOCR': 15,
    'generateReactComponent': 40,
    'searchDocuments': 12,
  };
  
  let baseTime = baseTimes[toolName] || 20;

  // Increase thinking time deterministically based on result payload size so that
  // server- and client-side renders stay in sync and avoid hydration mismatches.
  // (Using Math.random() at render time caused different HTML between server and
  //  client, triggering "Hydration failed…" warnings.)

  if (result && typeof result === 'object') {
    const resultSize = JSON.stringify(result).length;
    if (resultSize > 10000) baseTime += 10;
    if (resultSize > 50000) baseTime += 15;
  }

  return baseTime;
} 