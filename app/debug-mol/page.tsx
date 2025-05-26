'use client';

import React, { Suspense, useEffect } from 'react';
import { createLazyComponent, usePerformanceMonitor, ResourcePreloader } from '@/lib/performance/optimization';

// Lazy load the heavy 3D component only when needed
const Molecule3DViewer = createLazyComponent(
  () => import('../../components/visualizations/Molecule3DViewer'),
  'Molecule3DViewer'
);

// Loading component with better UX
const LoadingComponent = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Loading 3D Molecular Viewer</h3>
        <p className="text-gray-600 text-sm">Initializing visualization libraries...</p>
        <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load 3D Viewer</h3>
      <p className="text-gray-600 text-sm mb-4">{error.message}</p>
      <button 
        onClick={retry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retry Loading
      </button>
    </div>
  </div>
);

export default function DebugMolePage() {
  const performanceMonitor = usePerformanceMonitor('DebugMolePage');
  const [retryKey, setRetryKey] = React.useState(0);

  useEffect(() => {
    performanceMonitor.startMeasurement('page-load');
    
    // Preload critical resources
    const preloadResources = async () => {
      try {
        await Promise.all([
          ResourcePreloader.preloadScript('https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js', 'high'),
          ResourcePreloader.preloadScript('https://unpkg.com/3dmol@latest/build/3Dmol-min.js', 'high')
        ]);
        console.log('[DebugMolePage] Critical resources preloaded');
      } catch (error) {
        console.warn('[DebugMolePage] Failed to preload some resources:', error);
      }
    };

    preloadResources();

    // Register cleanup
    performanceMonitor.registerCleanup(() => {
      console.log('[DebugMolePage] Cleaning up resources');
    });

    // Check memory usage
    const memoryCheck = setInterval(() => {
      if (performanceMonitor.checkMemory()) {
        console.warn('[DebugMolePage] High memory usage detected');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryCheck);
      performanceMonitor.cleanup();
      performanceMonitor.endMeasurement('page-load');
    };
  }, [performanceMonitor]);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Molecule3DViewer Debug Page</h1>
          <p className="text-gray-600">
            Testing 3D molecular visualization with performance optimizations
          </p>
        </div>
        
        <div className="grid gap-6">
          {/* Performance Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Performance Optimizations</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Lazy loading of 3D libraries</li>
              <li>✓ Resource preloading for faster initialization</li>
              <li>✓ Memory usage monitoring</li>
              <li>✓ Automatic cleanup on unmount</li>
              <li>✓ Error boundary with retry functionality</li>
            </ul>
          </div>

          {/* Main 3D Viewer */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Ethanol (CCO) Test</h2>
            <div className="border rounded-lg overflow-hidden">
              <Suspense fallback={<LoadingComponent />}>
                <ErrorBoundary
                  key={retryKey}
                  fallback={(error) => <ErrorFallback error={error} retry={handleRetry} />}
                >
                  <Molecule3DViewer
                    identifierType="smiles"
                    identifier="CCO"
                    title="Ethanol"
                    description="Simple alcohol molecule for testing performance optimizations"
                    representationStyle="stick"
                  />
                </ErrorBoundary>
              </Suspense>
            </div>
          </div>

          {/* Additional Test Cases */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Caffeine (Complex Molecule)</h3>
              <div className="border rounded-lg overflow-hidden">
                <Suspense fallback={<LoadingComponent />}>
                  <ErrorBoundary
                    key={`caffeine-${retryKey}`}
                    fallback={(error) => <ErrorFallback error={error} retry={handleRetry} />}
                  >
                    <Molecule3DViewer
                      identifierType="smiles"
                      identifier="CN1C=NC2=C1C(=O)N(C(=O)N2C)C"
                      title="Caffeine"
                      description="More complex molecule to test performance"
                      representationStyle="stick"
                    />
                  </ErrorBoundary>
                </Suspense>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Water (Simple Molecule)</h3>
              <div className="border rounded-lg overflow-hidden">
                <Suspense fallback={<LoadingComponent />}>
                  <ErrorBoundary
                    key={`water-${retryKey}`}
                    fallback={(error) => <ErrorFallback error={error} retry={handleRetry} />}
                  >
                    <Molecule3DViewer
                      identifierType="smiles"
                      identifier="O"
                      title="Water"
                      description="Simplest molecule for baseline performance"
                      representationStyle="sphere"
                    />
                  </ErrorBoundary>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600 bg-white rounded-lg p-4">
          <h4 className="font-semibold mb-2">Debug Information:</h4>
          <ul className="space-y-1">
            <li>• This page tests the Molecule3DViewer component with performance optimizations</li>
            <li>• 3D libraries are loaded lazily to improve initial page load time</li>
            <li>• Memory usage is monitored and logged to the console</li>
            <li>• Check the browser console for detailed performance logs</li>
            <li>• Use browser DevTools Performance tab for detailed analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
} 