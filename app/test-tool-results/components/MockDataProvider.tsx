'use client';

export interface MockToolResult {
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
}

export const mockToolResults: MockToolResult[] = [
  // Molecule 3D Viewer - Success
  {
    toolName: 'displayMolecule3D',
    status: 'success',
    result: {
      identifierType: 'smiles',
      identifier: 'CCO',
      representationStyle: 'stick',
      colorScheme: 'element',
      title: '3D Structure of Ethanol',
      description: 'Interactive 3D visualization of ethanol molecule (C2H6O)',
    },
    metadata: {
      executionTime: 1200,
      dataSize: 2.4,
      complexity: 'medium',
      description: 'Molecular structure visualization'
    }
  },

  // Plotly Chart - Success
  {
    toolName: 'displayPlotlyChart',
    status: 'success',
    result: {
      data: [
        {
          x: [1, 2, 3, 4, 5],
          y: [2, 4, 3, 5, 6],
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Sample Data',
          line: { color: '#3B82F6' }
        }
      ],
      layout: {
        title: 'Sample Function Plot',
        xaxis: { title: 'X Values' },
        yaxis: { title: 'Y Values' },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' }
      },
      config: {
        responsive: true,
        displayModeBar: false
      }
    },
    metadata: {
      executionTime: 800,
      dataSize: 1.2,
      complexity: 'low',
      description: 'Interactive data visualization'
    }
  },

  // OCR Result - Success
  {
    toolName: 'performOCR',
    status: 'success',
    result: {
      extractedText: 'This is a sample text extracted from an image using OCR technology. The text recognition accuracy is quite good for clear, well-formatted documents.',
      confidence: 0.94,
      boundingBoxes: [
        { text: 'This', x: 10, y: 20, width: 30, height: 15 },
        { text: 'is', x: 45, y: 20, width: 15, height: 15 },
        { text: 'a', x: 65, y: 20, width: 10, height: 15 },
      ],
      language: 'en',
      processingTime: 2.3
    },
    metadata: {
      executionTime: 2300,
      dataSize: 0.8,
      complexity: 'medium',
      description: 'Optical character recognition'
    }
  },

  // Physics Simulation - Success
  {
    toolName: 'displayPhysicsSimulation',
    status: 'success',
    result: {
      simulationType: 'falling_objects',
      initialConditions: {
        objects: [
          {
            shape: 'circle',
            position: { x: 100, y: 50 },
            velocity: { x: 0, y: 0 },
            mass: 1,
            radius: 20
          },
          {
            shape: 'rectangle',
            position: { x: 200, y: 100 },
            velocity: { x: -1, y: 0 },
            mass: 2,
            width: 40,
            height: 30
          }
        ]
      },
      constants: {
        gravity: { x: 0, y: 0.8 },
        timeScale: 1
      },
      title: 'Falling Objects Simulation',
      description: 'Physics simulation showing gravitational effects on different objects'
    },
    metadata: {
      executionTime: 1500,
      dataSize: 3.2,
      complexity: 'high',
      description: 'Interactive physics simulation'
    }
  },

  // Loading States
  {
    toolName: 'displayMolecule3D',
    status: 'loading',
    metadata: {
      complexity: 'medium',
      description: 'Loading molecular structure...'
    }
  },

  {
    toolName: 'displayPlotlyChart',
    status: 'loading',
    metadata: {
      complexity: 'low',
      description: 'Generating chart...'
    }
  },

  // Error States
  {
    toolName: 'performOCR',
    status: 'error',
    error: 'Failed to process image: Invalid file format. Please upload a PNG, JPG, or PDF file.',
    metadata: {
      executionTime: 500,
      complexity: 'low',
      description: 'OCR processing failed'
    }
  },

  {
    toolName: 'displayPhysicsSimulation',
    status: 'error',
    error: 'Simulation parameters out of bounds: Mass values must be positive numbers.',
    metadata: {
      executionTime: 200,
      complexity: 'medium',
      description: 'Invalid simulation parameters'
    }
  },

  // Partial/Complex Results
  {
    toolName: 'displayMolecule3D',
    status: 'partial',
    result: {
      identifierType: 'pdb',
      identifier: '1BNA',
      representationStyle: 'cartoon',
      colorScheme: 'secondary',
      title: 'DNA Double Helix (Partial)',
      description: 'Large molecular structure - rendering in progress...',
      progress: 65
    },
    metadata: {
      executionTime: 5000,
      dataSize: 15.7,
      complexity: 'high',
      description: 'Complex molecular structure'
    }
  }
];

// Utility functions for generating dynamic mock data
export const generateMockResult = (toolName: string, status: MockToolResult['status'] = 'success'): MockToolResult => {
  const baseResult = mockToolResults.find(r => r.toolName === toolName && r.status === status);
  
  if (baseResult) {
    return {
      ...baseResult,
      metadata: {
        ...baseResult.metadata,
        executionTime: Math.random() * 3000 + 500, // Random execution time
        dataSize: Math.random() * 10 + 0.5, // Random data size
      }
    };
  }

  // Fallback for unknown tools
  return {
    toolName,
    status,
    error: status === 'error' ? `Unknown tool: ${toolName}` : undefined,
    metadata: {
      executionTime: Math.random() * 1000,
      dataSize: Math.random() * 5,
      complexity: 'medium',
      description: `Mock result for ${toolName}`
    }
  };
};

export const getToolIcon = (toolName: string): string => {
  const icons: Record<string, string> = {
    'displayMolecule3D': '🧬',
    'displayPlotlyChart': '📊',
    'performOCR': '📄',
    'displayPhysicsSimulation': '⚛️',
    'plotFunction2D': '📈',
    'plotFunction3D': '📉',
  };
  
  return icons[toolName] || '🔧';
};

export const getToolColor = (toolName: string): string => {
  const colors: Record<string, string> = {
    'displayMolecule3D': '#10B981', // Emerald
    'displayPlotlyChart': '#3B82F6', // Blue
    'performOCR': '#8B5CF6', // Purple
    'displayPhysicsSimulation': '#F59E0B', // Orange
    'plotFunction2D': '#06B6D4', // Cyan
    'plotFunction3D': '#8B5CF6', // Purple
  };
  
  return colors[toolName] || '#6B7280'; // Gray fallback
}; 