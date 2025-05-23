'use client';

import React from 'react';
import Molecule3DViewer from '../../components/visualizations/Molecule3DViewer';

export default function DebugMolePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Molecule3DViewer Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ethanol (CCO) Test</h2>
          <Molecule3DViewer
            identifierType="smiles"
            identifier="CCO"
            title="Ethanol"
            description="Simple alcohol molecule for testing"
            representationStyle="stick"
          />
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>This page tests the Molecule3DViewer component directly.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
} 