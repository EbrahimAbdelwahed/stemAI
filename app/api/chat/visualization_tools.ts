import { z } from 'zod';
import { tool } from 'ai';

// Helper function to get proper props for molecule viewer
async function getPropsForMoleculeViewer(identifierType: string, identifier: string, description?: string) {
  console.log(`[visualization_tools] getPropsForMoleculeViewer called with: ${identifierType}, ${identifier}`);

  // Return exactly what Simple3DMolViewer expects
  const props = {
    identifierType: identifierType as 'smiles' | 'pdb' | 'name' | 'cid',
    identifier: identifier,
    representationStyle: 'stick' as const,
    title: `3D Structure`,
    description: description || `3D view of ${identifierType.toUpperCase()}: ${identifier}`,
  };

  console.log(`[visualization_tools] Returning props:`, props);
  return props;
}

export const displayMolecule3D = tool({
  description: 'Displays a 3D molecular structure. Use for PDB IDs, SMILES strings, or compound IDs.',
  parameters: z.object({
    identifierType: z.enum(['pdb', 'smiles', 'cid', 'name'])
      .describe("The type of molecular identifier provided, e.g., 'pdb', 'smiles', 'cid', or 'name'."),
    identifier: z.string()
      .describe("The actual identifier string, e.g., '1CRN' for a PDB ID, 'CCO' for a SMILES string, or '702' for a PubChem CID."),
    description: z.string().optional()
      .describe('A brief description or context for the molecule being displayed that can be shown to the user.'),
  }),
  execute: async ({ identifierType, identifier, description }) => {
    try {
      console.log('[visualization_tools] displayMolecule3D execute called with:', { identifierType, identifier, description });
      
      const componentProps = await getPropsForMoleculeViewer(identifierType, identifier, description);
      
      console.log('[visualization_tools] displayMolecule3D execute: componentProps:', componentProps);
      return componentProps; 
    } catch (e: any) {
      console.error(`[visualization_tools] Error in displayMolecule3D execute for ${identifierType} ${identifier}:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to process ${identifierType} ${identifier}: ${e.message}`,
        details: { identifierType, identifier }
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

export const visualizationTools = {
  displayMolecule3D,
  plotFunction2D,
  plotFunction3D,
  displayPlotlyChart,
}; 