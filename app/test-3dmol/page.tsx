'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    $3Dmol: any;
  }
}

export default function Test3DMolPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const test3DMol = async () => {
      console.log('[Test3DMol] Starting test...');
      setStatus('Loading 3Dmol.js...');
      
      try {
        // Check if 3Dmol is already loaded
        if (window.$3Dmol) {
          console.log('[Test3DMol] 3Dmol already available');
          setStatus('3Dmol already loaded, creating viewer...');
        } else {
          // Load 3Dmol script
          const script = document.createElement('script');
          script.src = 'https://3dmol.org/build/3Dmol-min.js';
          script.async = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              console.log('[Test3DMol] Script loaded');
              if (window.$3Dmol) {
                console.log('[Test3DMol] $3Dmol available');
                resolve();
              } else {
                setTimeout(() => {
                  if (window.$3Dmol) {
                    console.log('[Test3DMol] $3Dmol available after delay');
                    resolve();
                  } else {
                    reject(new Error('$3Dmol not available after script load'));
                  }
                }, 1000);
              }
            };
            script.onerror = () => reject(new Error('Failed to load 3Dmol script'));
            document.head.appendChild(script);
          });
        }

        if (!containerRef.current) {
          throw new Error('Container not available');
        }

        setStatus('Creating 3D viewer...');
        
        // Clear container
        containerRef.current.innerHTML = '';
        
        // Create viewer with proper container dimensions
        const viewer = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'white',
          antialias: true,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
        
        console.log('[Test3DMol] Viewer created:', typeof viewer);
        setStatus('Adding ethanol molecule...');
        
        // Add a simple ethanol molecule (SMILES: CCO converted to SDF manually for testing)
        const ethanolSDF = `
     RDKit          3D

  3  2  0  0  0  0  0  0  0  0999 V2000
   -0.7145    0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.7145   -0.4125    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.4290    0.8250    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  2  3  1  0
M  END`;
        
        viewer.addModel(ethanolSDF, 'sdf');
        viewer.setStyle({}, { stick: { radius: 0.15 } });
        viewer.zoomTo();
        
        setStatus('Rendering...');
        viewer.render();
        
        setStatus('✅ Success! 3Dmol.js is working correctly.');
        console.log('[Test3DMol] Test completed successfully');
        
      } catch (error: any) {
        console.error('[Test3DMol] Test failed:', error);
        setError(error.message);
        setStatus('❌ Test failed');
      }
    };

    test3DMol();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">3Dmol.js Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`text-lg ${error ? 'text-red-600' : 'text-blue-600'}`}>
              {status}
            </div>
            {!error && !status.includes('✅') && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3D Viewer</h2>
          <div 
            ref={containerRef}
            className="w-full border-2 border-gray-300 rounded"
            style={{ height: '500px' }}
          />
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This page tests if 3Dmol.js can be loaded and used to display a simple ethanol molecule.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
} 