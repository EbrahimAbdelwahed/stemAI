import { z } from 'zod';

export const plotFunctionToolSchema = z.object({
  functionString: z.string().describe("The mathematical function to plot, e.g., 'sin(x)', 'x^2 * cos(y)'. Use common math.js syntax."),
  variables: z.array(z.object({
    name: z.string().describe("Name of the variable, e.g., 'x', 'y'."),
    range: z.tuple([z.number(), z.number()]).describe("Tuple representing [min, max] for the variable's range.")
  })).describe("Array of variables with their names and ranges."),
  plotType: z.enum(['scatter', 'line', 'surface', 'contour']).describe("Type of plot to generate."),
  title: z.string().optional().describe("Optional title for the plot."),
  // Future enhancements: labels, colors, etc.
});

export const plotFunctionTool = {
  name: 'plotFunctionTool',
  description: 'Generates parameters for plotting mathematical functions. Use this tool when a user asks to visualize a mathematical expression or dataset.',
  parameters: plotFunctionToolSchema,
  execute: async (params: z.infer<typeof plotFunctionToolSchema>) => {
    // TODO: Implement actual logic if needed for pre-computation or validation beyond Zod.
    // For now, it directly returns the validated parameters, assuming the LLM provides usable data.
    console.log('plotFunctionTool executed with:', params);
    return {
      vizType: 'plotly',
      params: params, // The validated and structured parameters for PlotlyPlotter.tsx
      description: `A ${params.plotType} plot titled '${params.title || params.functionString}' for the function ${params.functionString} with variables ${params.variables.map(v => v.name).join(', ')}. Ranges: ${params.variables.map(v => `${v.name}: [${v.range[0]}, ${v.range[1]}]`).join('; ')}.`
    };
  }
}; 