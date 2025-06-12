'use client';

import React, { useRef } from 'react';
import { getToolIcon, getToolColor } from '../../app/test-tool-results/components/MockDataProvider';
import { ToolLoadingState, TypingIndicator } from '../ui/LoadingStates';

interface ToolResultCardProps {
  toolName: string;
  status: 'loading' | 'success' | 'error' | 'partial';
  result?: unknown;
  error?: string;
  metadata?: {
    executionTime?: number;
    dataSize?: number;
    complexity?: 'low' | 'medium' | 'high';
    description?: string;
  };
  children?: React.ReactNode;
  onRetry?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  priority?: 'high' | 'normal' | 'low';
  lazy?: boolean;
}

// Helper function to detect if content contains visualizations
const hasVisualizationContent = (children: React.ReactNode, toolName: string): boolean => {
  // Check if toolName indicates visualization
  const visualizationTools = [
    'displayMolecule3D',
    'displayPlotlyChart',
    'plotFunction2D', 
    'plotFunction3D',
    'displayPhysicsSimulation',
    'performOCR'
  ];
  
  if (visualizationTools.includes(toolName)) {
    return true;
  }
  
  // Check if children contain visualization components
  if (React.isValidElement(children)) {
    const childType = children.type;
    if (typeof childType === 'function') {
      // Safely access displayName and name properties
      const componentWithName = childType as { displayName?: string; name?: string };
      const componentName = componentWithName.displayName || componentWithName.name || '';
      return componentName.includes('3D') || 
             componentName.includes('Mol') || 
             componentName.includes('Plot') || 
             componentName.includes('Chart') ||
             componentName.includes('Simulation') ||
             componentName.includes('Viewer');
    }
  }
  
  return false;
};

// Simple tool header component - no memo needed
function ToolHeader({ 
  toolName, 
  status, 
  metadata, 
  onRetry, 
  onExpand, 
  isExpanded 
}: {
  toolName: string;
  status: string;
  metadata?: ToolResultCardProps['metadata'];
  onRetry?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}) {
  // Simple function calls - no memoization needed for simple operations
  const toolIcon = getToolIcon(toolName);
  const toolColor = getToolColor(toolName);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
          style={{ 
            backgroundColor: `${toolColor}20`,
            color: toolColor,
            border: `1px solid ${toolColor}30`
          }}
        >
          {toolIcon}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-white">
            {toolName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h3>
          {metadata?.description && (
            <p className="text-xs text-gray-400">{metadata.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onRetry && status === 'error' && (
          <button
            onClick={onRetry}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Retry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        
        {onExpand && (
          <button
            onClick={onExpand}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Simple main component - only use memo if profiling shows it's needed
export default function ToolResultCard({
  toolName,
  status,
  result,
  error,
  metadata,
  children,
  onRetry,
  onExpand,
  isExpanded = false,
}: ToolResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Simple values - no memoization needed
  const toolColor = getToolColor(toolName);
  const isVisualizationContent = hasVisualizationContent(children, toolName);
  
  // Build class names without memoization
  const cardClasses = [
    'tool-result-card',
    'relative',
    'rounded-lg',
    'p-4',
    'border',
    'transition-all',
    'duration-200',
    'ease-out',
  ];

  // Add status-specific classes
  if (status === 'loading') {
    cardClasses.push('animate-pulse', 'opacity-80');
  } else if (status === 'success') {
    cardClasses.push('hover:scale-[1.01]', 'hover:shadow-lg');
  } else if (status === 'error') {
    cardClasses.push('border-red-500/30', 'bg-red-500/5');
  } else if (status === 'partial') {
    cardClasses.push('border-yellow-500/30', 'bg-yellow-500/5');
  }

  const renderContent = () => {
    if (status === 'loading') {
      return <ToolLoadingState toolName="Unknown Tool" />;
    }

    if (status === 'error') {
      return (
        <div className="text-red-400 text-sm">
          <p className="font-semibold mb-1">Error executing tool:</p>
          <pre className="whitespace-pre-wrap bg-red-500/10 p-2 rounded-md">
            <code>{error || 'An unknown error occurred.'}</code>
          </pre>
        </div>
      );
    }
    
    if (isVisualizationContent) {
        return children;
    }

    if (typeof result === 'string' && result.includes('Generating response...')) {
        return <TypingIndicator />;
    }

    if (children) {
      return children;
    }

    // Default case for non-visualization content
    return (
      <div className="prose prose-sm prose-invert max-w-none">
        <pre className="whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
            <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      </div>
    );
  };
  
  return (
    <div
      ref={cardRef}
      className={cardClasses.join(' ')}
      style={{
        backgroundColor: `${toolColor}10`,
        borderColor: `${toolColor}30`,
      }}
      data-tool={toolName}
      data-status={status}
    >
      <ToolHeader
        toolName={toolName}
        status={status}
        metadata={metadata}
        onRetry={onRetry}
        onExpand={onExpand}
        isExpanded={isExpanded}
      />

      <div
        ref={contentRef}
        className={isExpanded ? '' : 'max-h-96 overflow-hidden'}
      >
        {renderContent()}
      </div>
    </div>
  );
} 