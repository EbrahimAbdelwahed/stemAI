'use client';

import React, { FC, useEffect, useRef, useState } from 'react';

// Global 3Dmol state with better tracking
let $3Dmol: any = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Simplified 3Dmol loader with comprehensive debugging
const load3Dmol = async (): Promise<any> => {
  console.log('[3Dmol] Starting load attempt', ++loadAttempts);
  
  if ($3Dmol) {
    console.log('[3Dmol] Already loaded, returning cached instance');
    return $3Dmol;
  }

  if (typeof window === 'undefined') {
    console.log('[3Dmol] Window not available (SSR)');
    throw new Error('Window not available');
  }

  // Check if already available on window
  if (window.$3Dmol) {
    console.log('[3Dmol] Found existing window.$3Dmol');
    $3Dmol = window.$3Dmol;
    return $3Dmol;
  }

  // Create loading promise with timeout
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.error('[3Dmol] Loading timeout after 30 seconds');
      reject(new Error('3Dmol loading timeout'));
    }, 30000); // Increased timeout

    const onSuccess = () => {
      clearTimeout(timeoutId);
      if (window.$3Dmol) {
        $3Dmol = window.$3Dmol;
        console.log('[3Dmol] Successfully loaded, version:', window.$3Dmol?.version || 'unknown');
        resolve($3Dmol);
      } else {
        console.error('[3Dmol] Script loaded but $3Dmol not available');
        reject(new Error('3Dmol not available after script load'));
      }
    };

    const onError = (error: string) => {
      clearTimeout(timeoutId);
      console.error('[3Dmol] Loading failed:', error);
      reject(new Error(error));
    };

    // Check if script already exists
    const existingScript = document.getElementById('3dmol-script');
    if (existingScript) {
      console.log('[3Dmol] Script already exists, waiting for load...');
      // Wait for existing script to load
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        console.log('[3Dmol] Checking for $3Dmol, attempt:', checkCount);
        if (window.$3Dmol) {
          clearInterval(checkInterval);
          onSuccess();
        } else if (checkCount > 50) { // 5 seconds max
          clearInterval(checkInterval);
          onError('Timeout waiting for existing script');
        }
      }, 100);
      return;
    }

    // Create and load script
    console.log('[3Dmol] Creating new script element');
    const script = document.createElement('script');
    script.id = '3dmol-script';
    script.src = 'https://3dmol.org/build/3Dmol-min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('[3Dmol] Script onload event fired, checking for $3Dmol...');
      // Check immediately and then with delay
      if (window.$3Dmol) {
        onSuccess();
      } else {
        setTimeout(() => {
          if (window.$3Dmol) {
            onSuccess();
          } else {
            onError('$3Dmol not available after script load');
          }
        }, 500);
      }
    };
    
    script.onerror = (e) => {
      console.error('[3Dmol] Script error event:', e);
      onError('Failed to load 3Dmol script');
    };
    
    console.log('[3Dmol] Appending script to head');
    document.head.appendChild(script);
  });
};

// Extend Window interface for 3Dmol
declare global {
  interface Window {
    $3Dmol: any;
  }
}

export interface MolStarWrapperProps {
  moleculeInput: string | null;
  inputType: 'sdf' | 'pdb' | 'cid' | 'name' | 'smiles' | 'inchi' | 'inchikey';
  representationStyle?: 'stick' | 'sphere' | 'line' | 'cartoon' | 'surface';
  pluginRef?: React.MutableRefObject<any | null>;
  className?: string;
  style?: React.CSSProperties;
}

export const MolStarWrapper: FC<MolStarWrapperProps> = ({
  moleculeInput,
  inputType,
  representationStyle = 'stick',
  pluginRef,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing 3D viewer...');
  const viewerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const defaultStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '500px',
    minHeight: '300px',
    backgroundColor: 'white',
    overflow: 'hidden',
    ...style,
  };

  useEffect(() => {
    let cancelled = false;

    const initializeViewer = async () => {
      console.log('[MolStarWrapper] ===== STARTING INITIALIZATION =====');
      console.log('[MolStarWrapper] Input:', { moleculeInput, inputType, representationStyle });
      console.log('[MolStarWrapper] Container available:', !!containerRef.current);
      console.log('[MolStarWrapper] Component mounted:', mountedRef.current);
      
      if (!moleculeInput || !containerRef.current) {
        console.log('[MolStarWrapper] Missing requirements, aborting');
        setIsLoading(false);
        setError('No molecule input or container available');
        return;
      }

      try {
        console.log('[MolStarWrapper] Setting loading state to true');
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Loading 3D library...');

        // Load 3Dmol with detailed logging
        console.log('[MolStarWrapper] About to call load3Dmol()...');
        const viewer3d = await load3Dmol();
        
        if (cancelled || !mountedRef.current) {
          console.log('[MolStarWrapper] Component unmounted during 3Dmol load');
          return;
        }

        console.log('[MolStarWrapper] 3Dmol loaded successfully, type:', typeof viewer3d);
        setLoadingMessage('Creating 3D viewer...');

        // Clear container
        if (containerRef.current) {
          console.log('[MolStarWrapper] Clearing container');
          containerRef.current.innerHTML = '';
        }

        // Create viewer with error handling
        let viewer;
        try {
          console.log('[MolStarWrapper] Creating viewer with 3Dmol.createViewer...');
          viewer = viewer3d.createViewer(containerRef.current, {
            backgroundColor: 'white',
            antialias: true,
          });
          console.log('[MolStarWrapper] Viewer created successfully, type:', typeof viewer);
        } catch (viewerError) {
          console.error('[MolStarWrapper] Viewer creation error:', viewerError);
          throw new Error(`Failed to create 3Dmol viewer: ${viewerError}`);
        }

        viewerRef.current = viewer;
        
        if (pluginRef) {
          pluginRef.current = viewer;
        }

        console.log('[MolStarWrapper] Setting loading message to molecule data...');
        setLoadingMessage('Loading molecule data...');

        // Load molecule data with detailed logging
        let moleculeData = moleculeInput;
        
        if (inputType === 'pdb' && moleculeInput.length === 4) {
          console.log('[MolStarWrapper] Fetching PDB data for:', moleculeInput);
          const response = await fetch(`https://files.rcsb.org/download/${moleculeInput.toUpperCase()}.pdb`);
          if (response.ok) {
            moleculeData = await response.text();
            console.log('[MolStarWrapper] PDB data fetched successfully, length:', moleculeData.length);
          } else {
            throw new Error(`Could not fetch PDB ${moleculeInput}: ${response.status}`);
          }
        } else if (inputType === 'cid') {
          console.log('[MolStarWrapper] Fetching PubChem data for CID:', moleculeInput);
          const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${moleculeInput}/SDF`);
          if (response.ok) {
            moleculeData = await response.text();
            inputType = 'sdf';
            console.log('[MolStarWrapper] PubChem data fetched successfully, length:', moleculeData.length);
          } else {
            throw new Error(`Could not fetch compound ${moleculeInput}: ${response.status}`);
          }
        }

        if (cancelled || !mountedRef.current) {
          console.log('[MolStarWrapper] Component unmounted during data fetch');
          return;
        }

        console.log('[MolStarWrapper] Setting loading message to rendering...');
        setLoadingMessage('Rendering molecule...');

        // Add model with error handling
        try {
          console.log('[MolStarWrapper] Adding model to viewer');
          console.log('[MolStarWrapper] Model data preview:', moleculeData.substring(0, 100));
          console.log('[MolStarWrapper] Input type for viewer:', inputType === 'sdf' ? 'sdf' : inputType);
          viewer.addModel(moleculeData, inputType === 'sdf' ? 'sdf' : inputType);
          console.log('[MolStarWrapper] Model added successfully');
        } catch (modelError) {
          console.error('[MolStarWrapper] Model addition error:', modelError);
          throw new Error(`Failed to add molecule model: ${modelError}`);
        }

        // Apply style with error handling
        try {
          console.log('[MolStarWrapper] Applying representation style:', representationStyle);
          switch (representationStyle) {
            case 'sphere':
              viewer.setStyle({}, { sphere: { radius: 0.5 } });
              break;
            case 'line':
              viewer.setStyle({}, { line: { linewidth: 2 } });
              break;
            case 'cartoon':
              viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
              break;
            case 'surface':
              viewer.setStyle({}, { stick: {} });
              viewer.addSurface(viewer3d.SurfaceType.VDW, { opacity: 0.7 });
              break;
            default:
              viewer.setStyle({}, { stick: { radius: 0.15 } });
          }
          console.log('[MolStarWrapper] Style applied successfully');
        } catch (styleError) {
          console.warn('[MolStarWrapper] Style application failed, using default:', styleError);
          viewer.setStyle({}, { stick: { radius: 0.15 } });
        }

        // Render with error handling and multiple checks
        try {
          console.log('[MolStarWrapper] Starting zoom and render...');
          viewer.zoomTo();
          
          // Wait a bit to ensure rendering completes
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (cancelled || !mountedRef.current) {
            console.log('[MolStarWrapper] Component unmounted before render completion');
            return;
          }
          
          console.log('[MolStarWrapper] Calling viewer.render()...');
          viewer.render();
          console.log('[MolStarWrapper] Render completed');
          
          // Final check before marking as complete
          if (cancelled || !mountedRef.current) {
            console.log('[MolStarWrapper] Component unmounted after render');
            return;
          }
          
        } catch (renderError) {
          console.error('[MolStarWrapper] Render error:', renderError);
          throw new Error(`Failed to render molecule: ${renderError}`);
        }

        if (mountedRef.current) {
          console.log('[MolStarWrapper] ===== SUCCESSFULLY COMPLETED =====');
          setIsLoading(false);
          setLoadingMessage('');
        }

      } catch (error: any) {
        if (!cancelled && mountedRef.current) {
          console.error('[MolStarWrapper] ===== INITIALIZATION FAILED =====');
          console.error('[MolStarWrapper] Error details:', error);
          const errorMessage = error.message || 'Failed to load 3D viewer';
          setError(errorMessage);
          setIsLoading(false);
          setLoadingMessage('');
          
          // If we've failed multiple times, provide helpful message
          if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
            setError(`Failed to load 3D viewer after ${loadAttempts} attempts. This might be due to network issues or browser extensions interfering with the 3D library.`);
          }
        }
      }
    };

    console.log('[MolStarWrapper] useEffect triggered, calling initializeViewer...');
    initializeViewer();

    return () => {
      console.log('[MolStarWrapper] Cleanup function called');
      cancelled = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.clear();
        } catch (e) {
          console.warn('[MolStarWrapper] Error clearing viewer:', e);
        }
        viewerRef.current = null;
      }
    };
  }, [moleculeInput, inputType, representationStyle]);

  useEffect(() => {
    return () => {
      console.log('[MolStarWrapper] Component unmounting, setting mountedRef to false');
      mountedRef.current = false;
    };
  }, []);

  console.log('[MolStarWrapper] Render function called', { isLoading, error, moleculeInput });

  if (!moleculeInput) {
    return (
      <div className={className} style={defaultStyle}>
        <div className="flex items-center justify-center h-full text-gray-500">
          No molecule data provided
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={defaultStyle}>
        <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
          <div className="text-center">
            <div className="font-semibold mb-2">Error loading 3D viewer</div>
            <div className="text-sm mb-4">{error}</div>
            <div className="text-xs text-gray-500">
              Tip: Try refreshing the page or check browser console for details
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={defaultStyle}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700 mb-2">
              {loadingMessage || 'Loading 3D viewer...'}
            </div>
            <div className="text-sm text-gray-500">
              Attempt {loadAttempts} of {MAX_LOAD_ATTEMPTS}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              This may take a few moments...
            </div>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        style={{ position: 'relative' }}
      />
    </div>
  );
}; 