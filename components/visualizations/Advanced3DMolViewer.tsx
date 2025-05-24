'use client';

import React, { useEffect, useRef, useState } from 'react';

// Extend existing global declarations
declare global {
  interface Window {
    $3Dmol: any;
  }
}

// Define RDKit interfaces separately
interface RDKitMol {
  is_valid(): boolean;
  get_molblock(): string;
  delete(): void;
}

interface RDKitModule {
  get_mol: (smiles: string) => RDKitMol;
  version: () => string;
}

// Enhanced cache for advanced molecule data
interface EnhancedCachedMolecule {
  moleculeData: string;
  format: string;
  timestamp: number;
  representationStyle: string;
  colorScheme: string;
  selections: any[];
  showSurface: boolean;
  surfaceType: string;
  surfaceOpacity: number;
  showLabels: boolean;
  backgroundColor: string;
}

// Global cache for successfully loaded molecules (enhanced)
const enhancedMoleculeCache = new Map<string, EnhancedCachedMolecule>();
const enhancedSuccessfullyRendered = new Set<string>();

// Helper to create enhanced cache key including all visualization options
function createEnhancedCacheKey(
  identifierType: string, 
  identifier: string, 
  representationStyle: string,
  colorScheme: string,
  selections: any[],
  showSurface: boolean,
  surfaceType: string,
  surfaceOpacity: number,
  showLabels: boolean,
  backgroundColor: string
): string {
  const selectionsStr = JSON.stringify(selections);
  return `${identifierType}:${identifier}:${representationStyle}:${colorScheme}:${selectionsStr}:${showSurface}:${surfaceType}:${surfaceOpacity}:${showLabels}:${backgroundColor}`;
}

// Utility function to clear problematic cache entries
export function clearAdvancedMoleculeCache(identifierType?: string, identifier?: string) {
  if (identifierType && identifier) {
    // Clear specific molecule from cache
    const pattern = `${identifierType}:${identifier}:`;
    for (const key of enhancedMoleculeCache.keys()) {
      if (key.startsWith(pattern)) {
        enhancedMoleculeCache.delete(key);
        enhancedSuccessfullyRendered.delete(key);
      }
    }
  } else {
    // Clear all cache
    enhancedMoleculeCache.clear();
    enhancedSuccessfullyRendered.clear();
  }
  console.log('[Advanced3DMolViewer] Cleared enhanced molecule cache');
}

export interface Advanced3DMolViewerProps {
  identifierType: 'smiles' | 'pdb' | 'name' | 'cid';
  identifier: string;
  representationStyle: 'stick' | 'sphere' | 'line' | 'cartoon' | 'surface' | 'ball-stick';
  colorScheme: 'element' | 'chain' | 'residue' | 'ss' | 'spectrum' | 'custom';
  selections: Array<{
    region: string;
    style: 'stick' | 'sphere' | 'line' | 'cartoon' | 'surface';
    color?: string;
  }>;
  showSurface: boolean;
  surfaceType: 'vdw' | 'sas' | 'ms';
  surfaceOpacity: number;
  showLabels: boolean;
  backgroundColor: string;
  title?: string;
  description?: string;
}

const Advanced3DMolViewer: React.FC<Advanced3DMolViewerProps> = ({
  identifierType,
  identifier,
  representationStyle = 'stick',
  colorScheme = 'element',
  selections = [],
  showSurface = false,
  surfaceType = 'vdw',
  surfaceOpacity = 0.7,
  showLabels = false,
  backgroundColor = 'white',
  title,
  description,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing 3D viewer...');
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const executedRef = useRef<string>('');
  const renderedRef = useRef<boolean>(false);

  // Create stable keys
  const moleculeKey = `${identifierType}:${identifier}`;
  const cacheKey = createEnhancedCacheKey(
    identifierType, identifier, representationStyle, colorScheme,
    selections, showSurface, surfaceType, surfaceOpacity, 
    showLabels, backgroundColor
  );

  // Check if this molecule was already successfully rendered
  const wasSuccessfullyRendered = enhancedSuccessfullyRendered.has(cacheKey);
  const cachedMolecule = enhancedMoleculeCache.get(cacheKey);

  // Enhanced effect with better duplicate prevention
  useEffect(() => {
    if (executedRef.current === cacheKey) {
      console.log('[Advanced3DMolViewer] Already executed for cache key:', cacheKey);
      return;
    }

    // Check if this exact configuration was already successfully rendered
    if (wasSuccessfullyRendered && cachedMolecule) {
      console.log('[Advanced3DMolViewer] Using cached molecule:', cacheKey);
      renderFromCache(cachedMolecule);
      return;
    }

    // Mark this cache key as being executed to prevent re-execution
    console.log('[Advanced3DMolViewer] Marking as executed:', cacheKey);
    executedRef.current = cacheKey;

    // Reset state for new render
    setError(null);
    setIsLoaded(false);
    setStatus('Initializing 3D viewer...');
    renderedRef.current = false;

    const load3DMol = async () => {
      console.log('[Advanced3DMolViewer] Starting fresh initialization for:', cacheKey);
      
      try {
        setStatus('Loading 3Dmol.js...');
        setError(null);
        setIsLoaded(false);

        // Load 3Dmol script if not already loaded
        if (!window.$3Dmol) {
          const script = document.createElement('script');
          script.src = 'https://3dmol.org/build/3Dmol-min.js';
          script.async = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              if (window.$3Dmol) {
                resolve();
              } else {
                setTimeout(() => {
                  if (window.$3Dmol) {
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
        
        // Create viewer with custom background color
        const viewer = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: backgroundColor,
          antialias: true,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });

        setStatus('Loading molecule data...');

        let moleculeData: string;
        let format: string;

        if (identifierType === 'smiles') {
          // Load RDKit for SMILES processing
          const rdkitWindow = window as any;
          if (!rdkitWindow.RDKit) {
            setStatus('Loading RDKit for SMILES processing...');
            
            const rdkitScript = document.createElement('script');
            rdkitScript.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js';
            rdkitScript.async = true;
            document.head.appendChild(rdkitScript);

            await new Promise<void>((resolve, reject) => {
              rdkitScript.onload = () => {
                rdkitWindow.initRDKitModule({ 
                  locateFile: (file: string) => `https://unpkg.com/@rdkit/rdkit/dist/${file}` 
                }).then((rdkit: RDKitModule) => {
                  console.log('RDKit loaded:', rdkit.version());
                  rdkitWindow.RDKit = rdkit;
                  resolve();
                }).catch(reject);
              };
              rdkitScript.onerror = () => reject(new Error('Failed to load RDKit'));
            });
          }

          // Convert SMILES to SDF
          const rdkit: RDKitModule = rdkitWindow.RDKit;
          const mol = rdkit.get_mol(identifier);
          if (mol && mol.is_valid()) {
            moleculeData = mol.get_molblock();
            format = 'sdf';
            mol.delete();
          } else {
            if (mol) mol.delete();
            throw new Error(`Invalid SMILES: ${identifier}`);
          }
        } else if (identifierType === 'pdb' && identifier.length === 4) {
          // Fetch PDB data
          setStatus('Fetching PDB data...');
          const response = await fetch(`https://files.rcsb.org/download/${identifier.toUpperCase()}.pdb`);
          if (response.ok) {
            moleculeData = await response.text();
            format = 'pdb';
          } else {
            throw new Error(`Could not fetch PDB ${identifier}: ${response.status}`);
          }
        } else if (identifierType === 'cid') {
          // Fetch PubChem data
          setStatus('Fetching PubChem data...');
          const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${identifier}/SDF`);
          if (response.ok) {
            moleculeData = await response.text();
            format = 'sdf';
          } else {
            throw new Error(`Could not fetch compound ${identifier}: ${response.status}`);
          }
        } else {
          throw new Error(`Unsupported identifier type: ${identifierType}`);
        }

        // Cache the molecule data for future use (enhanced)
        enhancedMoleculeCache.set(cacheKey, {
          moleculeData,
          format,
          timestamp: Date.now(),
          representationStyle,
          colorScheme,
          selections,
          showSurface,
          surfaceType,
          surfaceOpacity,
          showLabels,
          backgroundColor
        });

        setStatus('Rendering molecule...');
        
        // Render the molecule with advanced options
        await renderAdvancedMolecule(
          viewer, moleculeData, format, representationStyle, colorScheme,
          selections, showSurface, surfaceType, surfaceOpacity, showLabels
        );
        
        // Mark as successfully rendered
        enhancedSuccessfullyRendered.add(cacheKey);
        renderedRef.current = true;
        setStatus('✅ Advanced 3D model loaded successfully!');
        setIsLoaded(true);
        console.log('[Advanced3DMolViewer] Successfully loaded and cached:', cacheKey);
        
      } catch (error: any) {
        console.error('[Advanced3DMolViewer] Error:', error);
        setError(error.message);
        setStatus('❌ Failed to load 3D model');
        // Reset execution guard on error so it can be retried
        executedRef.current = '';
      }
    };

    load3DMol();
  }, [cacheKey]); // Using cacheKey to include all visualization options

  // Helper function to render from cache with enhanced duplicate prevention
  const renderFromCache = async (cached: EnhancedCachedMolecule) => {
    try {
      setStatus('Loading from cache...');
      setError(null);
      setIsLoaded(false);

      // Ensure 3Dmol is loaded
      if (!window.$3Dmol) {
        setStatus('Loading 3Dmol.js...');
        const script = document.createElement('script');
        script.src = 'https://3dmol.org/build/3Dmol-min.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            if (window.$3Dmol) {
              resolve();
            } else {
              setTimeout(() => {
                if (window.$3Dmol) {
                  resolve();
                } else {
                  reject(new Error('$3Dmol not available after script load'));
                }
              }, 1000);
            }
          };
          script.onerror = () => reject(new Error('Failed to load 3Dmol script'));
        });
      }

      if (!containerRef.current) {
        throw new Error('Container not available');
      }

      setStatus('Rendering cached molecule...');
      
      // Clear container completely to prevent duplication
      containerRef.current.innerHTML = '';
      
      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create viewer
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: cached.backgroundColor || backgroundColor,
        antialias: true,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });

      // Render from cached data with all advanced options
      await renderAdvancedMolecule(
        viewer, 
        cached.moleculeData, 
        cached.format, 
        cached.representationStyle,
        cached.colorScheme,
        cached.selections || [],
        cached.showSurface || false,
        cached.surfaceType || 'vdw',
        cached.surfaceOpacity || 0.7,
        cached.showLabels || false
      );
      
      renderedRef.current = true;
      setStatus('✅ Advanced 3D model loaded from cache!');
      setIsLoaded(true);
      console.log('[Advanced3DMolViewer] Successfully rendered from cache:', cacheKey);
      
    } catch (error: any) {
      console.error('[Advanced3DMolViewer] Cache render error:', error);
      // If cache fails, remove from cache and try fresh
      enhancedMoleculeCache.delete(cacheKey);
      enhancedSuccessfullyRendered.delete(cacheKey);
      // Reset execution guard to allow retry
      executedRef.current = '';
      setError(error.message);
      setStatus('❌ Failed to load from cache');
    }
  };

  // Advanced molecule rendering function
  const renderAdvancedMolecule = async (
    viewer: any, 
    moleculeData: string, 
    format: string, 
    style: string,
    coloring: string,
    selections: any[],
    surface: boolean,
    surfType: string,
    surfOpacity: number,
    labels: boolean
  ) => {
    // Add model to viewer
    viewer.addModel(moleculeData, format);
    
    // Apply main representation style with color scheme
    const colorConfig = getColorConfig(coloring);
    
    switch (style) {
      case 'sphere':
        viewer.setStyle({}, { sphere: { radius: 0.5, ...colorConfig } });
        break;
      case 'line':
        viewer.setStyle({}, { line: { linewidth: 2, ...colorConfig } });
        break;
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { ...colorConfig } });
        break;
      case 'ball-stick':
        viewer.setStyle({}, { 
          stick: { radius: 0.15, ...colorConfig },
          sphere: { radius: 0.3, ...colorConfig }
        });
        break;
      case 'surface':
        // For surface style, still show stick underneath
        viewer.setStyle({}, { stick: { radius: 0.1, ...colorConfig } });
        break;
      default:
        viewer.setStyle({}, { stick: { radius: 0.15, ...colorConfig } });
    }

    // Apply region-specific selections
    if (selections && selections.length > 0) {
      for (const selection of selections) {
        try {
          const selectionObj = parseSelection(selection.region);
          const selectionColorConfig = selection.color ? { color: selection.color } : colorConfig;
          
          switch (selection.style) {
            case 'sphere':
              viewer.addStyle(selectionObj, { sphere: { radius: 0.5, ...selectionColorConfig } });
              break;
            case 'line':
              viewer.addStyle(selectionObj, { line: { linewidth: 2, ...selectionColorConfig } });
              break;
            case 'cartoon':
              viewer.addStyle(selectionObj, { cartoon: { ...selectionColorConfig } });
              break;
            case 'surface':
              viewer.addStyle(selectionObj, { stick: { radius: 0.1, ...selectionColorConfig } });
              break;
            default:
              viewer.addStyle(selectionObj, { stick: { radius: 0.15, ...selectionColorConfig } });
          }
        } catch (selError) {
          console.warn('[Advanced3DMolViewer] Invalid selection:', selection.region, selError);
        }
      }
    }

    // Add surface if requested
    if (surface || style === 'surface') {
      const surfaceTypeMap = {
        'vdw': window.$3Dmol.SurfaceType.VDW,
        'sas': window.$3Dmol.SurfaceType.SAS,
        'ms': window.$3Dmol.SurfaceType.MS
      };
      
      const surfaceType = surfaceTypeMap[surfType as keyof typeof surfaceTypeMap] || window.$3Dmol.SurfaceType.VDW;
      viewer.addSurface(surfaceType, { opacity: surfOpacity, ...colorConfig });
    }

    // Add labels if requested
    if (labels) {
      // Add basic atom labels (for small molecules) or residue labels (for proteins)
      if (format === 'pdb') {
        // For PDB, add residue labels
        viewer.addResLabels({}, { fontSize: 12, showBackground: false });
      } else {
        // For small molecules, add atom labels
        viewer.addLabels({}, { fontSize: 10, showBackground: false });
      }
    }
    
    viewer.zoomTo();
    viewer.render();
    
    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  // Helper function to get color configuration
  const getColorConfig = (colorScheme: string) => {
    switch (colorScheme) {
      case 'chain':
        return { colorscheme: 'chain' };
      case 'residue':
        return { colorscheme: 'residue' };
      case 'ss':
        return { colorscheme: 'ss' };
      case 'spectrum':
        return { colorscheme: 'spectrum' };
      case 'element':
      default:
        return {}; // Default element coloring
    }
  };

  // Helper function to parse selection strings
  const parseSelection = (region: string) => {
    // Simple parser for common selection patterns
    // This could be enhanced to support more complex 3Dmol selection syntax
    if (region.includes('chain')) {
      const chainMatch = region.match(/chain\s+([A-Za-z0-9]+)/i);
      if (chainMatch) {
        return { chain: chainMatch[1] };
      }
    }
    if (region.includes('resi')) {
      const resiMatch = region.match(/resi\s+(\d+)(-(\d+))?/i);
      if (resiMatch) {
        if (resiMatch[3]) {
          // Range
          return { resi: `${resiMatch[1]}-${resiMatch[3]}` };
        } else {
          // Single residue
          return { resi: parseInt(resiMatch[1]) };
        }
      }
    }
    if (region.toLowerCase() === 'ligand' || region.toLowerCase() === 'hetero') {
      return { hetflag: true };
    }
    
    // Fallback: try to parse as raw 3Dmol selection
    try {
      return JSON.parse(region);
    } catch {
      console.warn('[Advanced3DMolViewer] Could not parse selection:', region);
      return {};
    }
  };

  if (error) {
    return (
      <div className="my-4 p-4 border rounded-lg shadow bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Advanced 3D Model</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => {
            // Clear all caches and refs for this molecule
            executedRef.current = '';
            renderedRef.current = false;
            enhancedMoleculeCache.delete(cacheKey);
            enhancedSuccessfullyRendered.delete(cacheKey);
            setError(null);
            setStatus('Retrying...');
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border rounded-lg shadow">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      
      {/* Advanced options display */}
      <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-4">
        <span>Style: {representationStyle}</span>
        <span>Colors: {colorScheme}</span>
        {showSurface && <span>Surface: {surfaceType} ({Math.round(surfaceOpacity * 100)}%)</span>}
        {showLabels && <span>Labels: enabled</span>}
        {selections.length > 0 && <span>Selections: {selections.length}</span>}
      </div>
      
      <div className="bg-white rounded border border-gray-300" style={{ height: '500px', position: 'relative' }}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">{status}</div>
              {wasSuccessfullyRendered && (
                <div className="text-xs text-green-600 mt-1">Using cached data</div>
              )}
            </div>
          </div>
        )}
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ backgroundColor }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Molecule: {identifier} ({identifierType.toUpperCase()})</p>
        {wasSuccessfullyRendered && (
          <p className="text-green-600">✓ Previously cached</p>
        )}
      </div>
    </div>
  );
};

export default Advanced3DMolViewer; 