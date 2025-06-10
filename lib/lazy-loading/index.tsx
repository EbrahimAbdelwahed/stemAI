import { lazy, ComponentType, LazyExoticComponent, Suspense } from 'react';

// Generic loading skeleton
export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-800 rounded ${className}`}>
    <div className="h-32 bg-gray-700 rounded"></div>
  </div>
);

// Visualization loading skeleton
export const VisualizationSkeleton = () => (
  <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading visualization...</div>
  </div>
);

// Chart loading skeleton
export const ChartSkeleton = () => (
  <div className="w-full h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
);

// 3D Molecule loading skeleton
export const Molecule3DSkeleton = () => (
  <div className="w-full h-96 bg-gray-900 rounded-lg animate-pulse flex flex-col items-center justify-center border border-gray-700">
    <div className="w-16 h-16 bg-gray-700 rounded-full mb-4 animate-spin"></div>
    <div className="text-gray-400">Loading 3D molecular viewer...</div>
  </div>
);

// Code preview loading skeleton  
export const CodePreviewSkeleton = () => (
  <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse p-4">
    <div className="h-4 bg-gray-700 rounded mb-3 w-1/4"></div>
    <div className="h-3 bg-gray-700 rounded mb-2"></div>
    <div className="h-3 bg-gray-700 rounded mb-2 w-5/6"></div>
    <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
  </div>
);

// Preload component for better UX
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  // Preload on requestIdleCallback or setTimeout
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(console.error);
    });
  } else {
    setTimeout(() => {
      importFn().catch(console.error);
    }, 1000);
  }
}

// Smart preloading based on user behavior
export function useSmartPreloading() {
  // Preload commonly used components
  const preloadVisualizations = () => {
    import('../../components/visualizations/LazyComponents').catch(console.error);
  };
  
  // Preload AI models based on user's previous selections
  const preloadAIModels = (modelHistory: string[]) => {
    modelHistory.forEach(model => {
      if (model.startsWith('gpt-') || model.startsWith('o1-')) {
        import('@ai-sdk/openai').catch(console.error);
      } else if (model.startsWith('claude-')) {
        import('@ai-sdk/anthropic').catch(console.error);
      } else if (model.startsWith('gemini-')) {
        import('@ai-sdk/google').catch(console.error);
      } else if (model.startsWith('grok-')) {
        import('@ai-sdk/xai').catch(console.error);
      }
    });
  };
  
  // Preload based on current conversation context
  const preloadBasedOnContext = (conversationContent: string) => {
    if (conversationContent.includes('plot') || conversationContent.includes('chart')) {
      import('react-plotly.js').catch(console.error);
    }
    
    if (conversationContent.includes('molecule') || conversationContent.includes('3D')) {
      import('../../components/visualizations/Molecule3DViewer').catch(console.error);
    }
    
    if (conversationContent.includes('physics') || conversationContent.includes('simulation')) {
      import('../../components/visualizations/MatterSimulator').catch(console.error);
    }
  };
  
  return {
    preloadVisualizations,
    preloadAIModels,
    preloadBasedOnContext,
  };
} 