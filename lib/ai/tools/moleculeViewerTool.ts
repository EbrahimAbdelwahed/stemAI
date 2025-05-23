import { z } from 'zod';

export const moleculeViewerToolSchema = z.object({
  identifierType: z.enum(['smiles', 'inchi', 'inchikey', 'name', 'cid']).describe("Type of molecular identifier provided."),
  identifier: z.string().describe("The molecular identifier string (e.g., a SMILES string, InChI string, chemical name, or PubChem CID)."),
  representationStyle: z.enum(['stick', 'sphere', 'line', 'cartoon', 'surface']).optional().default('stick').describe("Desired 3D representation style for the molecule."),
  colorScheme: z.enum(['element', 'residue', 'chain', 'structure']).optional().default('element').describe("Coloring scheme for the molecule."),
  title: z.string().optional().describe("Optional title for the molecule visualization.")
  // Add other 3DMol.js or Mol* specific options as needed
});

export const moleculeViewerTool = {
  name: 'moleculeViewerTool',
  description: 'Generates parameters for 3D visualization of molecules. Use this when a user asks to see a molecular structure. Provide a SMILES string or PubChem CID if possible.',
  parameters: moleculeViewerToolSchema,
  execute: async (params: z.infer<typeof moleculeViewerToolSchema>) => {
    console.log('moleculeViewerTool executed with:', params);
    // TODO: Add logic to potentially fetch SMILES/3D data if only a name/CID is provided,
    // or canonicalize SMILES using RDKit.js if needed before passing to viewer.
    // This might involve calling another tool or a helper function.

    const description = `3D molecular view of '${params.title || params.identifier}'. Identifier: ${params.identifier} (type: ${params.identifierType}). Style: ${params.representationStyle}, Colors: ${params.colorScheme}.`;

    return {
      vizType: 'molecule3d',
      params: {
        identifierType: params.identifierType,
        identifier: params.identifier,
        representationStyle: params.representationStyle,
        colorScheme: params.colorScheme,
        title: params.title,
      },
      description: description
    };
  }
}; 