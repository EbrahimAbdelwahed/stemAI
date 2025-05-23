import { z } from 'zod';
import { tool } from 'ai';
import { physicsSimulationTool } from '../../../lib/ai/tools/physicsSimulationTool';

// Helper function to get proper props for molecule viewer (updated for advanced options)
async function getPropsForMoleculeViewer(
  identifierType: string, 
  identifier: string, 
  representationStyle: string = 'stick',
  colorScheme: string = 'element',
  selections: any[] = [],
  showSurface: boolean = false,
  surfaceType: string = 'vdw',
  surfaceOpacity: number = 0.7,
  showLabels: boolean = false,
  backgroundColor: string = 'white',
  description?: string
) {
  console.log(`[visualization_tools] getPropsForMoleculeViewer called with advanced options:`, {
    identifierType, identifier, representationStyle, colorScheme, selections, 
    showSurface, surfaceType, surfaceOpacity, showLabels, backgroundColor
  });

  // Return exactly what Advanced3DMolViewer will expect
  const props = {
    identifierType: identifierType as 'smiles' | 'pdb' | 'name' | 'cid',
    identifier,
    representationStyle: representationStyle as 'stick' | 'sphere' | 'line' | 'cartoon' | 'surface' | 'ball-stick',
    colorScheme: colorScheme as 'element' | 'chain' | 'residue' | 'ss' | 'spectrum' | 'custom',
    selections,
    showSurface,
    surfaceType: surfaceType as 'vdw' | 'sas' | 'ms',
    surfaceOpacity,
    showLabels,
    backgroundColor,
    title: `3D Structure - ${identifier}`,
    description: description || `Advanced 3D view of ${identifierType.toUpperCase()}: ${identifier}`,
  };

  console.log(`[visualization_tools] Returning advanced props:`, props);
  return props;
}

export const displayMolecule3D = tool({
  description: 'Displays a 3D molecular structure with advanced visualization options. Supports PDB, SMILES, CID, and compound names with customizable representation styles, coloring schemes, surface rendering, and region-specific styling.',
  parameters: z.object({
    identifierType: z.enum(['pdb', 'smiles', 'cid', 'name'])
      .describe("Molecular identifier type: 'pdb' for Protein Data Bank IDs, 'smiles' for chemical structure notation, 'cid' for PubChem compound IDs, or 'name' for compound names"),
    identifier: z.string()
      .describe("The molecular identifier (e.g., '1CRN' for PDB, 'CCO' for ethanol SMILES, '702' for PubChem CID)"),
    
    // Advanced visualization options
    representationStyle: z.enum(['stick', 'sphere', 'line', 'cartoon', 'surface', 'ball-stick']).default('stick')
      .describe("3D representation style: 'stick' for bond representation, 'sphere' for space-filling, 'line' for wireframe, 'cartoon' for protein secondary structure, 'surface' for molecular surface, 'ball-stick' for combined spheres and sticks"),
    colorScheme: z.enum(['element', 'chain', 'residue', 'ss', 'spectrum', 'custom']).default('element')
      .describe("Coloring scheme: 'element' for atomic colors, 'chain' for protein chains, 'residue' for amino acid types, 'ss' for secondary structure, 'spectrum' for gradient coloring, 'custom' for user-defined colors"),
    
    // Region-specific options
    selections: z.array(z.object({
      region: z.string().describe("Selection criteria using 3Dmol syntax (e.g., 'chain A', 'resi 25-50', 'ligand', 'hetero')"),
      style: z.enum(['stick', 'sphere', 'line', 'cartoon', 'surface']).describe("Representation style for this specific region"),
      color: z.string().optional().describe("Custom color for this region (e.g., 'red', '#FF0000', 'rgb(255,0,0)')")
    })).optional().describe("Array of region-specific styling rules to apply different representations to parts of the molecule"),
    
    // Surface options
    showSurface: z.boolean().default(false).describe("Whether to display molecular surface alongside the main representation"),
    surfaceType: z.enum(['vdw', 'sas', 'ms']).default('vdw').describe("Type of surface: 'vdw' for Van der Waals, 'sas' for solvent-accessible, 'ms' for molecular surface"),
    surfaceOpacity: z.number().min(0).max(1).default(0.7).describe("Surface transparency (0 = transparent, 1 = opaque)"),
    
    // Display options
    showLabels: z.boolean().default(false).describe("Whether to show atom or residue labels on the structure"),
    backgroundColor: z.string().default('white').describe("Background color of the 3D viewer (e.g., 'white', 'black', '#f0f0f0')"),
    
    description: z.string().optional()
      .describe('Optional description or context for the molecule being displayed'),
  }),
  execute: async ({ 
    identifierType, identifier, representationStyle, colorScheme, 
    selections, showSurface, surfaceType, surfaceOpacity, 
    showLabels, backgroundColor, description 
  }) => {
    try {
      console.log('[visualization_tools] displayMolecule3D execute called with advanced options:', { 
        identifierType, identifier, representationStyle, colorScheme, 
        selections, showSurface, surfaceType, surfaceOpacity, 
        showLabels, backgroundColor, description 
      });
      
      const componentProps = await getPropsForMoleculeViewer(
        identifierType, identifier, representationStyle, colorScheme,
        selections || [], showSurface, surfaceType, surfaceOpacity,
        showLabels, backgroundColor, description
      );
      
      console.log('[visualization_tools] displayMolecule3D execute: returning advanced componentProps:', componentProps);
      return componentProps; 
    } catch (e: any) {
      console.error(`[visualization_tools] Error in displayMolecule3D execute for ${identifierType} ${identifier}:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to process ${identifierType} ${identifier}: ${e.message}`,
        details: { identifierType, identifier, representationStyle, colorScheme }
      };
    }
  },
});

export const plotFunction2D = tool({
  description: 'Plots 2D mathematical functions. Use for single-variable functions like sin(x), x^2, etc.',
  parameters: z.object({
    functionString: z.string()
      .describe("The mathematical function to plot using math.js syntax, e.g., 'sin(x)', 'x^2', 'log(x)', 'exp(x)'."),
    variable: z.object({
      name: z.string().describe("Name of the variable, typically 'x'."),
      range: z.tuple([z.number(), z.number()]).describe("Range [min, max] for the variable.")
    }).describe("The variable definition with name and range."),
    plotType: z.enum(['line', 'scatter']).default('line')
      .describe("Type of 2D plot: 'line' for continuous curves, 'scatter' for discrete points."),
    title: z.string().optional()
      .describe("Optional title for the plot."),
  }),
  execute: async ({ functionString, variable, plotType, title }) => {
    try {
      console.log('[visualization_tools] plotFunction2D execute called with:', { functionString, variable, plotType, title });
      
      // Return exactly what PlotlyPlotter expects
      const params = {
        functionString,
        variables: [variable], // PlotlyPlotter expects an array
        plotType,
        title: title || `Plot of ${functionString}`,
      };
      
      const description = `2D ${plotType} plot of ${functionString} for ${variable.name} from ${variable.range[0]} to ${variable.range[1]}`;
      
      console.log('[visualization_tools] plotFunction2D returning:', { params, description });
      return { params, description };
    } catch (e: any) {
      console.error(`[visualization_tools] Error in plotFunction2D execute:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to create 2D plot: ${e.message}`,
        details: { functionString, variable }
      };
    }
  },
});

export const plotFunction3D = tool({
  description: 'Plots 3D mathematical functions. Use for two-variable functions like sin(x)*cos(y), x^2 + y^2, etc.',
  parameters: z.object({
    functionString: z.string()
      .describe("The mathematical function to plot using math.js syntax, e.g., 'sin(x) * cos(y)', 'x^2 + y^2', 'exp(-(x^2 + y^2))'."),
    variables: z.array(z.object({
      name: z.string().describe("Name of the variable, typically 'x' or 'y'."),
      range: z.tuple([z.number(), z.number()]).describe("Range [min, max] for the variable.")
    })).length(2).describe("Array of exactly 2 variables with their names and ranges."),
    plotType: z.enum(['surface', 'contour']).default('surface')
      .describe("Type of 3D plot: 'surface' for 3D surface plots, 'contour' for contour plots."),
    title: z.string().optional()
      .describe("Optional title for the plot."),
  }),
  execute: async ({ functionString, variables, plotType, title }) => {
    try {
      console.log('[visualization_tools] plotFunction3D execute called with:', { functionString, variables, plotType, title });
      
      // Return exactly what PlotlyPlotter expects
      const params = {
        functionString,
        variables,
        plotType,
        title: title || `3D Plot of ${functionString}`,
      };
      
      const [xVar, yVar] = variables;
      const description = `3D ${plotType} plot of ${functionString} for ${xVar.name} from ${xVar.range[0]} to ${xVar.range[1]} and ${yVar.name} from ${yVar.range[0]} to ${yVar.range[1]}`;
      
      console.log('[visualization_tools] plotFunction3D returning:', { params, description });
      return { params, description };
    } catch (e: any) {
      console.error(`[visualization_tools] Error in plotFunction3D execute:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to create 3D plot: ${e.message}`,
        details: { functionString, variables }
      };
    }
  },
});

// Keep the generic displayPlotlyChart for backwards compatibility
export const displayPlotlyChart = tool({
  description: 'Displays a 2D plot or chart using Plotly. Use for data that can be plotted like line charts, scatter plots, etc.',
  parameters: z.object({
    data: z.any().describe('The data array for Plotly (e.g., [{ x: [], y: [], type: "scatter" }]).'),
    layout: z.any().optional().describe('The layout object for Plotly.'),
    description: z.string().optional().describe('A brief description of the chart.'),
  }),
  execute: async ({ data, layout, description }) => {
    try {
      // This function directly returns what PlotlyPlotter.tsx needs.
      return {
        data,
        layout: layout || { title: description || 'Chart' },
        description: description || 'Interactive Plot',
      };
    } catch (e: any) {
      console.error(`[visualization_tools] Error in displayPlotlyChart execute:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to generate chart: ${e.message}`,
        details: { description }
      };
    }
  },
});

// Enhanced physics simulation tool following the established pattern
export const displayPhysicsSimulation = tool({
  description: 'Displays a 2D physics simulation using Matter.js. Use for requests involving physics concepts like falling objects, collisions, pendulums, springs, projectiles, inclined planes, and other mechanics demonstrations.',
  parameters: physicsSimulationTool.parameters,
  execute: async (params) => {
    try {
      console.log('[visualization_tools] displayPhysicsSimulation execute called with:', params);
      
      // Use the enhanced physics simulation tool execute function
      const result = await physicsSimulationTool.execute(params);
      
      // Extract the actual component props from the tool result
      const componentProps = result.params;
      
      console.log('[visualization_tools] displayPhysicsSimulation returning props:', componentProps);
      return componentProps;
    } catch (e: any) {
      console.error(`[visualization_tools] Error in displayPhysicsSimulation execute:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to create physics simulation: ${e.message}`,
        details: { simulationType: params.simulationType }
      };
    }
  },
});

export const visualizationTools = {
  displayMolecule3D,
  plotFunction2D,
  plotFunction3D,
  displayPlotlyChart,
  displayPhysicsSimulation,
}; 