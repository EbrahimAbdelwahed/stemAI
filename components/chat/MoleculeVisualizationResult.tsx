'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent SSR issues
const Simple3DMolViewer = dynamic(() => import('../visualizations/Simple3DMolViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px] bg-white rounded-lg text-gray-500">Loading 3D viewer...</div>,
});

interface MoleculeVisualizationResultProps {
  result: any;
}

export function MoleculeVisualizationResult({ result }: MoleculeVisualizationResultProps) {
  // Check if this is a scaffold analysis (multiple molecules)
  const hasScaffold = result.molecules && Array.isArray(result.molecules) && result.molecules.length > 1;
  
  if (hasScaffold) {
    // Side-by-side molecule display like ChatGPT ritonavir example
    return (
      <div className="space-y-6">
        {/* Main description */}
        {result.description && (
          <div className="text-[#c5c5d2] leading-relaxed">
            {result.description}
          </div>
        )}
        
        {/* Side-by-side molecule grid */}
        <div className="grid grid-cols-2 gap-8">
          {result.molecules.map((molecule: any, index: number) => (
            <div key={index} className="space-y-3">
              {/* Molecule label */}
              <div className="text-center">
                <h4 className="text-white font-medium text-sm">
                  {molecule.name || `Molecule ${index + 1}`}
                </h4>
              </div>
              
              {/* 3D Viewer with white background */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[300px]">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading...
                  </div>
                }>
                  <Simple3DMolViewer
                    identifierType={molecule.identifierType || 'smiles'}
                    identifier={molecule.identifier}
                    representationStyle={molecule.representationStyle || 'stick'}
                    title={molecule.name}
                  />
                </Suspense>
              </div>
            </div>
          ))}
        </div>
        
        {/* Technical details in expandable section */}
        {(result.scaffoldType || result.scaffoldSmiles) && (
          <details className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#4d4d4d]">
            <summary className="text-[#8e8ea0] cursor-pointer hover:text-white transition-colors text-sm font-medium">
              Technical Details
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              {result.scaffoldType && (
                <div className="flex justify-between">
                  <span className="text-[#8e8ea0]">Scaffold Type:</span>
                  <span className="text-[#c5c5d2] font-mono">{result.scaffoldType}</span>
                </div>
              )}
              {result.scaffoldSmiles && (
                <div className="flex justify-between">
                  <span className="text-[#8e8ea0]">Scaffold SMILES:</span>
                  <span className="text-[#c5c5d2] font-mono text-xs break-all">
                    {result.scaffoldSmiles}
                  </span>
                </div>
              )}
              {result.molecules?.[0]?.identifier && (
                <div className="flex justify-between">
                  <span className="text-[#8e8ea0]">Original SMILES:</span>
                  <span className="text-[#c5c5d2] font-mono text-xs break-all">
                    {result.molecules[0].identifier}
                  </span>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    );
  }
  
  // Single molecule display
  return (
    <div className="space-y-4">
      {/* Description */}
      {result.description && (
        <div className="text-[#c5c5d2] leading-relaxed">
          {result.description}
        </div>
      )}
      
      {/* Single molecule viewer */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[400px]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading 3D visualization...
          </div>
        }>
          <Simple3DMolViewer
            identifierType={result.identifierType || 'smiles'}
            identifier={result.identifier}
            representationStyle={result.representationStyle || 'stick'}
            title={result.name}
          />
        </Suspense>
      </div>
      
      {/* Metadata if available */}
      {(result.identifierType || result.identifier) && (
        <details className="p-4 bg-[#1a1a1a] rounded-lg border border-[#4d4d4d]">
          <summary className="text-[#8e8ea0] cursor-pointer hover:text-white transition-colors text-sm font-medium">
            Molecule Information
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            {result.name && (
              <div className="flex justify-between">
                <span className="text-[#8e8ea0]">Name:</span>
                <span className="text-[#c5c5d2]">{result.name}</span>
              </div>
            )}
            {result.identifierType && (
              <div className="flex justify-between">
                <span className="text-[#8e8ea0]">Identifier Type:</span>
                <span className="text-[#c5c5d2] uppercase">{result.identifierType}</span>
              </div>
            )}
            {result.identifier && (
              <div className="flex justify-between">
                <span className="text-[#8e8ea0]">Identifier:</span>
                <span className="text-[#c5c5d2] font-mono text-xs break-all">
                  {result.identifier}
                </span>
              </div>
            )}
            {result.representationStyle && (
              <div className="flex justify-between">
                <span className="text-[#8e8ea0]">Style:</span>
                <span className="text-[#c5c5d2] capitalize">{result.representationStyle}</span>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
} 