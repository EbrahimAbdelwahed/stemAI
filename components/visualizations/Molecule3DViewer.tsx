'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MolStarWrapper } from './MolStarWrapper';

// Define RDKitModule interface
interface RDKitModule {
  get_mol: (smiles: string) => any;
  version: () => string;
}

declare global {
  interface Window {
    RDKit: RDKitModule | undefined;
    initRDKitModule: (options?: { locateFile?: (file: string) => string }) => Promise<RDKitModule>;
  }
}

export interface Molecule3DViewerProps {
  identifierType: 'smiles' | 'inchi' | 'inchikey' | 'name' | 'cid';
  identifier: string;
  representationStyle?: 'stick' | 'sphere' | 'line' | 'cartoon' | 'surface';
  colorScheme?: 'element' | 'residue' | 'chain' | 'structure';
  title?: string;
  description?: string;
}

const Molecule3DViewer: React.FC<Molecule3DViewerProps> = (props) => {
  const {
  identifierType,
  identifier,
  representationStyle = 'stick',
  title,
  description,
  } = props;

  // Stable memoized key to prevent unnecessary re-renders
  const moleculeKey = useMemo(() => 
    `${identifierType}:${identifier}`, [identifierType, identifier]
  );

  // Simplified state management
  const [moleculeData, setMoleculeData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent re-execution
  const molstarPlugin = useRef<any | null>(null);
  const hasLoggedRef = useRef<string>('');
  const initExecutedRef = useRef<string>(''); // Track which molecule we've initialized
  const rdkitRef = useRef<RDKitModule | null>(null);

  // Log only once per molecule
  if (hasLoggedRef.current !== moleculeKey) {
    console.log('[Molecule3DViewer] New molecule:', { identifierType, identifier });
    hasLoggedRef.current = moleculeKey;
    // Reset execution guard for new molecule
    if (initExecutedRef.current !== moleculeKey) {
      console.log('[Molecule3DViewer] Resetting execution guard for new molecule');
      initExecutedRef.current = '';
    }
  }

  // Stable RDKit loader - memoized to prevent re-creation
  const loadRDKit = useCallback(async (): Promise<RDKitModule | null> => {
    if (rdkitRef.current) {
      return rdkitRef.current;
    }

    if (window.RDKit) {
      rdkitRef.current = window.RDKit;
      return window.RDKit;
    }

    const scriptId = 'rdkit-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js';
          script.async = true;
          document.head.appendChild(script);

      return new Promise((resolve, reject) => {
        script!.onload = () => {
          window.initRDKitModule({ 
            locateFile: (file) => `https://unpkg.com/@rdkit/rdkit/dist/${file}` 
          })
              .then((loadedRdkit) => {
            console.log('RDKit loaded:', loadedRdkit.version());
                window.RDKit = loadedRdkit;
                rdkitRef.current = loadedRdkit;
            resolve(loadedRdkit);
              })
          .catch(reject);
          };
        script!.onerror = () => reject(new Error('Failed to load RDKit script'));
      });
    }

    // Script exists, wait for RDKit to be available
    if (window.RDKit) {
      rdkitRef.current = window.RDKit;
      return window.RDKit;
    }
    
    // Wait for RDKit with timeout
    return new Promise((resolve, reject) => {
      const checkRDKit = () => {
        if (window.RDKit) {
          rdkitRef.current = window.RDKit;
          resolve(window.RDKit);
        } else {
          setTimeout(checkRDKit, 100);
        }
      };
      setTimeout(() => reject(new Error('RDKit load timeout')), 10000);
      checkRDKit();
    });
  }, []);

  // Process SMILES to SDF
  const processSMILES = useCallback((rdkit: RDKitModule, smiles: string): string | null => {
    try {
      const mol = rdkit.get_mol(smiles);
      if (mol && mol.is_valid()) {
        const sdf = mol.get_molblock();
        mol.delete();
        return sdf;
      } else {
        if (mol) mol.delete();
        return null;
      }
    } catch (e) {
      console.error('Error processing SMILES:', e);
      return null;
    }
  }, []);

  // Main initialization effect - runs once per molecule, with execution guard
  useEffect(() => {
    let cancelled = false;

    // Guard: Don't re-execute for the same molecule
    if (initExecutedRef.current === moleculeKey) {
      console.log('[Molecule3DViewer] Already initialized for:', moleculeKey, 'skipping re-initialization');
      return;
    }

    const initializeMolecule = async () => {
      console.log('[Molecule3DViewer] Starting initialization for:', moleculeKey);
      
      // Mark as executing to prevent re-runs
      initExecutedRef.current = moleculeKey;
      
      // Reset state for new molecule
      setIsLoading(true);
      setError(null);
      setMoleculeData(null);

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.error('[Molecule3DViewer] Initialization timeout for:', moleculeKey);
          setError('Initialization timeout - please try again');
          setIsLoading(false);
          initExecutedRef.current = ''; // Reset so it can be retried
        }
      }, 15000); // 15 second timeout

      try {
        if (identifierType === 'smiles') {
          console.log('[Molecule3DViewer] Loading RDKit...');
          // Load RDKit for SMILES processing
          const rdkit = await loadRDKit();
          if (cancelled) {
            console.log('[Molecule3DViewer] Cancelled during RDKit load');
            return;
          }
          
          if (!rdkit) {
            throw new Error('Failed to load RDKit');
          }
          console.log('[Molecule3DViewer] RDKit loaded successfully');

          // Process SMILES
          console.log('[Molecule3DViewer] Processing SMILES:', identifier);
          const sdf = processSMILES(rdkit, identifier);
          console.log('[Molecule3DViewer] SMILES processing result:', sdf ? 'success' : 'failed', sdf ? `(${sdf.length} chars)` : '');
          if (cancelled) {
            console.log('[Molecule3DViewer] Cancelled during SMILES processing');
            return;
          }

          if (sdf) {
            console.log('[Molecule3DViewer] Setting molecule data and finishing...');
            setMoleculeData(sdf);
            setIsLoading(false);
            clearTimeout(timeoutId);
            console.log('[Molecule3DViewer] ✓ Successfully processed SMILES for:', identifier);
          } else {
            console.log('[Molecule3DViewer] ✗ SMILES processing failed for:', identifier);
            setError(`Invalid SMILES: ${identifier}`);
            setIsLoading(false);
            clearTimeout(timeoutId);
          }
        } else {
          // Non-SMILES identifiers - pass directly to 3Dmol
          console.log('[Molecule3DViewer] Using direct identifier (non-SMILES):', identifier);
          setMoleculeData(identifier);
          setIsLoading(false);
          clearTimeout(timeoutId);
          console.log('[Molecule3DViewer] ✓ Set direct identifier:', identifier);
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (!cancelled) {
          console.error('[Molecule3DViewer] Initialization failed:', error);
          setError(error.message || 'Failed to initialize molecule');
          setIsLoading(false);
          // Reset execution guard on error so it can be retried
          initExecutedRef.current = '';
        }
      }
    };

    initializeMolecule();

    return () => {
      cancelled = true;
    };
  }, [moleculeKey]); // Only depend on moleculeKey to prevent unnecessary re-runs

  // Reset execution guard when molecule changes
  useEffect(() => {
    if (initExecutedRef.current && initExecutedRef.current !== moleculeKey) {
      console.log('[Molecule3DViewer] Molecule changed, resetting execution guard');
      initExecutedRef.current = '';
      // Reset state for new molecule
      setIsLoading(true);
      setError(null);
      setMoleculeData(null);
    }
  }, [moleculeKey]);

  // Render logic with stable references
  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 border border-red-500 rounded">
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        Loading 3D Molecule ({title || identifier})...
      </div>
    );
  }

  if (!moleculeData) {
    return (
      <div className="p-4 text-orange-500 bg-orange-100 border border-orange-500 rounded">
        Could not generate 3D model for {identifier}
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border rounded-lg shadow">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      <div style={{ height: '500px', width: '100%', position: 'relative', border: '1px solid #ccc' }}>
            <MolStarWrapper
          key={moleculeKey} // Force remount on molecule change
          moleculeInput={moleculeData}
          inputType={identifierType === 'smiles' ? 'sdf' : identifierType}
                representationStyle={representationStyle}
                pluginRef={molstarPlugin}
            />
      </div>
    </div>
  );
};

export default Molecule3DViewer; 