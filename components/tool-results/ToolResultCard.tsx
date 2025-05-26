'use client';

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
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

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'loading':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: '⏳',
          text: 'Processing'
        };
      case 'success':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: '✅',
          text: 'Complete'
        };
      case 'error':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: '❌',
          text: 'Error'
        };
      case 'partial':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: '⏸️',
          text: 'Partial'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: '❓',
          text: 'Unknown'
        };
    }
  }, [status]);

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
      <span>{statusConfig.icon}</span>
      <span>{statusConfig.text}</span>
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Memoized tool header component
const ToolHeader = memo(({ 
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
}) => {
  const toolIcon = useMemo(() => getToolIcon(toolName), [toolName]);
  const toolColor = useMemo(() => getToolColor(toolName), [toolName]);
  
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const handleExpand = useCallback(() => {
    onExpand?.();
  }, [onExpand]);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        {/* Tool Icon */}
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
        
        {/* Tool Info */}
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
        {/* Status Badge */}
        <StatusBadge status={status} />
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {status === 'error' && onRetry && (
            <button
              onClick={handleRetry}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              title="Retry"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {onExpand && (
            <button
              onClick={handleExpand}
              className="p-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <svg 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ToolHeader.displayName = 'ToolHeader';

// Main ToolResultCard component with extreme performance optimization
const ToolResultCard = memo<ToolResultCardProps>(({
  toolName,
  status,
  result,
  error,
  metadata,
  children,
  onRetry,
  onExpand,
  isExpanded = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolColor = useMemo(() => getToolColor(toolName), [toolName]);
  
  // Detect if content contains visualizations
  const isVisualizationContent = useMemo(() => 
    hasVisualizationContent(children, toolName), 
    [children, toolName]
  );
  
  // Performance monitoring
  useEffect(() => {
    if (cardRef.current) {
      const startTime = performance.now();
      
      // Mark render start
      performance.mark(`tool-result-${toolName}-start`);
      
      return () => {
        const endTime = performance.now();
        performance.mark(`tool-result-${toolName}-end`);
        performance.measure(
          `tool-result-${toolName}`,
          `tool-result-${toolName}-start`,
          `tool-result-${toolName}-end`
        );
        
        // Log slow renders
        const renderTime = endTime - startTime;
        if (renderTime > 50) {
          console.warn(`Slow render: ${toolName} took ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }, [toolName, status]);

  // Memoized CSS custom properties for theming
  const cssVariables = useMemo(() => ({
    '--tool-color': toolColor,
    '--tool-bg': `${toolColor}10`,
    '--tool-border': `${toolColor}30`,
  } as React.CSSProperties), [toolColor]);

  // Memoized class names for performance
  const cardClasses = useMemo(() => {
    const baseClasses = [
      'tool-result-card',
      'relative',
      'rounded-lg',
      'p-4',
      'border',
      'transition-all',
      'duration-200',
      'ease-out',
      // CSS containment for performance
      'contain-layout',
      'contain-style',
      'contain-paint',
    ];

    // Status-specific classes
    switch (status) {
      case 'loading':
        baseClasses.push('animate-pulse', 'opacity-80');
        break;
      case 'success':
        baseClasses.push('hover:scale-[1.01]', 'hover:shadow-lg');
        break;
      case 'error':
        baseClasses.push('border-red-500/30', 'bg-red-500/5');
        break;
      case 'partial':
        baseClasses.push('border-yellow-500/30', 'bg-yellow-500/5');
        break;
    }

    return baseClasses.join(' ');
  }, [status]);

  // Smart content height classes
  const contentClasses = useMemo(() => {
    const baseClasses = ['transition-all', 'duration-200'];
    
    if (isVisualizationContent) {
      // For visualizations: provide adequate space, allow expansion
      if (isExpanded) {
        baseClasses.push('max-h-none');
      } else {
        baseClasses.push('min-h-[500px]', 'max-h-[600px]', 'overflow-hidden');
      }
    } else {
      // For text content: use original constraints
      if (isExpanded) {
        baseClasses.push('max-h-none');
      } else {
        baseClasses.push('max-h-96', 'overflow-hidden');
      }
    }
    
    return baseClasses.join(' ');
  }, [isVisualizationContent, isExpanded]);

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={{
        ...cssVariables,
        backgroundColor: 'var(--tool-bg)',
        borderColor: 'var(--tool-border)',
        // Hardware acceleration
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        // Backdrop blur for glassmorphism
        backdropFilter: 'blur(8px)',
      }}
      data-tool={toolName}
      data-status={status}
      data-testid={`tool-result-${toolName}`}
    >
      {/* Tool Header */}
      <ToolHeader
        toolName={toolName}
        status={status}
        metadata={metadata}
        onRetry={onRetry}
        onExpand={onExpand}
        isExpanded={isExpanded}
      />

      {/* Content Area with Smart Height Management */}
      <div ref={contentRef} className={contentClasses}>
        {/* Error Display */}
        {status === 'error' && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <div className="text-red-400 mt-0.5">⚠️</div>
              <div>
                <p className="text-sm text-red-300 font-medium">Error occurred</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Display */}
        {status === 'loading' && (
          <div className="flex items-center space-x-3 py-4">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-300">
              {metadata?.description || 'Processing...'}
            </span>
          </div>
        )}

        {/* Success/Partial Content */}
        {(status === 'success' || status === 'partial') && children && (
          <div className="space-y-3">
            {children}
          </div>
        )}

        {/* Content Overflow Indicator for Non-Visualization Content */}
        {!isVisualizationContent && !isExpanded && (status === 'success' || status === 'partial') && children && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none" />
        )}

        {/* Metadata Footer */}
        {metadata && (status === 'success' || status === 'partial') && (
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                {metadata.executionTime && (
                  <span>⏱️ {metadata.executionTime}ms</span>
                )}
                {metadata.dataSize && (
                  <span>💾 {metadata.dataSize.toFixed(1)}MB</span>
                )}
                {metadata.complexity && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    metadata.complexity === 'high' ? 'bg-red-500/20 text-red-400' :
                    metadata.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {metadata.complexity}
                  </span>
                )}
              </div>
              
              {/* Visualization Content Indicator */}
              {isVisualizationContent && (
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    📊 Visualization
                  </span>
                </div>
              )}
              
              {status === 'partial' && result && typeof result === 'object' && result !== null && 'progress' in result && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all duration-300"
                      style={{ width: `${(result as { progress: number }).progress}%` }}
                    />
                  </div>
                  <span>{(result as { progress: number }).progress}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ToolResultCard.displayName = 'ToolResultCard';

export default ToolResultCard; 