---
version: 1.0
status: draft
maintainer: AI Core Team
references:
  - ROLE_DEFINITION.md
  - SYSTEM_PROMPT_DESIGN.md
security_thresholds:
  max_tool_output_length: 10000 # characters
  max_tool_execution_time: 30 # seconds
---
<!--
Document: TOOL_USAGE_GUIDELINES.md
Purpose: Documents available tools for StemAI-Copilot, their usage, parameters, and safety checks.
Version: 1.0
Last Updated: {{TODAY_DATE}}
-->

# Tool Usage Guidelines for StemAI-Copilot

This document provides detailed instructions for using the specialized tools available to `StemAI-Copilot v1.0` within the STEM AI Assistant project. Adherence to these guidelines is mandatory for safe and effective tool utilization. All tool parameters are defined using Zod schemas in their respective tool definition files.

## General Tool Usage Principles

1.  **Necessity:** Only use a tool if the user's request explicitly or implicitly requires its functionality (e.g., visualizing a molecule, plotting a function).
2.  **Parameterization:** Provide all required parameters as defined by the tool's Zod schema. Validate input types and constraints.
3.  **Idempotency:** Where possible, tools should be designed to be idempotent or their non-idempotent nature clearly understood and handled.
4.  **Error Handling:** If a tool execution is expected to fail or encounters an error, report thisfailure transparently to the user.
5.  **Resource Limits:** Be mindful of potential resource consumption (e.g., complex physics simulations). If a request might lead to excessive computation, confirm with the user, especially if it involves client-side rendering impact.
6.  **Safety Checks:** Internal safety checks within the tools are designed to prevent misuse. Do not attempt to bypass these.

## Available Tools

### 1. `moleculeViewerTool`

*   **File:** `lib/ai/tools/moleculeViewerTool.ts`
*   **Description:** Generates parameters for 3D visualization of molecules. Use this when a user asks to see a molecular structure. Provide a SMILES string, InChI, name, or PubChem CID if possible.
*   **Output `vizType`:** `molecule3d` (to be handled by a corresponding frontend component)

#### Parameters (`moleculeViewerToolSchema`):

```typescript
{
  identifierType: z.enum(['smiles', 'inchi', 'inchikey', 'name', 'cid']).describe("Type of molecular identifier provided."),
  identifier: z.string().describe("The molecular identifier string (e.g., a SMILES string, InChI string, chemical name, or PubChem CID)."),
  representationStyle: z.enum(['stick', 'sphere', 'line', 'cartoon', 'surface']).optional().default('stick').describe("Desired 3D representation style for the molecule."),
  colorScheme: z.enum(['element', 'residue', 'chain', 'structure']).optional().default('element').describe("Coloring scheme for the molecule."),
  title: z.string().optional().describe("Optional title for the molecule visualization.")
}
```

#### Usage Example:

User Request: "Show me the 3D structure of caffeine as spheres."

Tool Call (Conceptual):
`moleculeViewerTool` with parameters:
```json
{
  "identifierType": "name",
  "identifier": "caffeine",
  "representationStyle": "sphere",
  "colorScheme": "element",
  "title": "Caffeine (Sphere Representation)"
}
```

#### Safety Checks & Notes:
*   The tool expects a valid identifier type and corresponding identifier string.
*   The `execute` function currently passes through parameters. Future enhancements might involve fetching/canonicalizing molecular data.
*   The frontend component receiving `vizType: 'molecule3d'` is responsible for rendering using a library like 3DMol.js or Mol*.

### 2. `physicsSimulationTool`

*   **File:** `lib/ai/tools/physicsSimulationTool.ts`
*   **Description:** Generates parameters for running and visualizing 2D physics simulations using Matter.js. Use this for requests involving falling objects, collisions, pendulums, etc.
*   **Output `vizType`:** `matterjs` (to be handled by a corresponding frontend component)

#### Parameters (`physicsSimulationToolSchema`):

```typescript
{
  simulationType: z.enum(['falling_objects', 'pendulum', 'custom_matter_js_setup']).describe("Type of physics simulation to run."),
  initialConditions: z.object({
    objects: z.array(z.object({
      shape: z.enum(['circle', 'rectangle']).optional().default('circle'),
      position: z.object({ x: z.number(), y: z.number() }),
      velocity: z.object({ x: z.number(), y: z.number() }).optional().default({x: 0, y: 0}),
      mass: z.number().positive().optional().default(1),
      radius: z.number().positive().optional(), // For circles
      width: z.number().positive().optional(),  // For rectangles
      height: z.number().positive().optional(), // For rectangles
      options: z.record(z.any()).optional().describe("Additional Matter.js Body options like restitution, friction, etc.")
    })).optional().describe("Array of objects with their initial properties for the simulation."),
    pendulumLength: z.number().positive().optional().describe("Length of the pendulum."),
    initialAngle: z.number().optional().describe("Initial angle of the pendulum in degrees."),
    customSetupInstructions: z.string().optional().describe("Detailed instructions or JSON configuration for a custom Matter.js scene.")
  }).describe("Initial conditions for the simulation."),
  constants: z.object({
    gravity: z.object({ x: z.number(), y: z.number() }).optional().default({ x: 0, y: 1 }),
    timeScale: z.number().positive().optional().default(1)
  }).optional().describe("Physical constants or simulation parameters."),
  simulationDuration: z.number().positive().optional().default(10).describe("Suggested duration for the simulation in seconds."),
  title: z.string().optional().describe("Optional title for the simulation visualization.")
}
```

#### Usage Example:

User Request: "Simulate two balls falling and colliding."

Tool Call (Conceptual):
`physicsSimulationTool` with parameters:
```json
{
  "simulationType": "falling_objects",
  "initialConditions": {
    "objects": [
      { "shape": "circle", "position": { "x": 50, "y": 50 }, "radius": 10, "options": { "restitution": 0.8 } },
      { "shape": "circle", "position": { "x": 70, "y": 100 }, "radius": 15, "options": { "restitution": 0.8 } }
    ]
  },
  "constants": { "gravity": { "x": 0, "y": 0.98 } },
  "simulationDuration": 15,
  "title": "Falling Balls Collision"
}
```

#### Safety Checks & Notes:
*   For `custom_matter_js_setup`, the `customSetupInstructions` string should be carefully constructed to avoid malicious or overly complex scenarios if it directly translates to executable Matter.js code or configuration.
*   The number of objects and simulation duration should be reasonable to prevent performance issues on the client-side renderer.
*   The frontend component receiving `vizType: 'matterjs'` is responsible for setting up and running the Matter.js simulation.

### 3. `plotFunctionTool`

*   **File:** `lib/ai/tools/plotFunctionTool.ts`
*   **Description:** Generates parameters for plotting mathematical functions. Use this tool when a user asks to visualize a mathematical expression or dataset.
*   **Output `vizType`:** `plotly` (to be handled by a corresponding frontend component, e.g., `PlotlyPlotter.tsx`)

#### Parameters (`plotFunctionToolSchema`):

```typescript
{
  functionString: z.string().describe("The mathematical function to plot, e.g., 'sin(x)', 'x^2 * cos(y)'. Use common math.js syntax."),
  variables: z.array(z.object({
    name: z.string().describe("Name of the variable, e.g., 'x', 'y'."),
    range: z.tuple([z.number(), z.number()]).describe("Tuple representing [min, max] for the variable's range.")
  })).describe("Array of variables with their names and ranges."),
  plotType: z.enum(['scatter', 'line', 'surface', 'contour']).describe("Type of plot to generate."),
  title: z.string().optional().describe("Optional title for the plot.")
}
```

#### Usage Example:

User Request: "Plot sin(x) * cos(y) from x=-5 to 5 and y=-5 to 5 as a surface plot."

Tool Call (Conceptual):
`plotFunctionTool` with parameters:
```json
{
  "functionString": "sin(x) * cos(y)",
  "variables": [
    { "name": "x", "range": [-5, 5] },
    { "name": "y", "range": [-5, 5] }
  ],
  "plotType": "surface",
  "title": "Plot of sin(x) * cos(y)"
}
```

#### Safety Checks & Notes:
*   The `functionString` uses `math.js` syntax. Ensure the syntax is valid and does not contain potentially harmful expressions (though `math.js` itself has some parsing safety).
*   Variable ranges should be sensible to avoid excessive data generation for plotting.
*   The frontend component (e.g., `PlotlyPlotter.tsx`) receiving `vizType: 'plotly'` is responsible for evaluating the function and rendering the plot using Plotly.js.

## Security: Command Execution Guardrail (Illustrative)

While current tools primarily pass data to frontend components, if any future tool were to involve backend command execution (e.g., running a linter or code formatter via a terminal command), strict guardrails must be in place.

**Hypothetical Example (NOT an existing tool):**

```typescript
// This is a conceptual illustration of a safety measure.
// It does NOT represent an actual tool in the system.

function potentiallyExecuteCommand(command: string, context: any) {
  const SENSITIVE_COMMAND_PATTERNS = [
    /rm -rf/,
    /mv .* \//, // Moving files to root or sensitive locations
    /chmod -R 777/
    // Add other potentially dangerous patterns
  ];

  if (SENSITIVE_COMMAND_PATTERNS.some(pattern => pattern.test(command))) {
    // Log the incident
    console.error(`CRITICAL: Attempt to execute sensitive command: ${command}`, { audit_trail: context });
    // Trigger an incident response (e.g., notify admin, halt operation)
    // throw new Error(`Execution of command "${command}" is prohibited due to security policy.`);
    return { error: "Command execution blocked by security policy.", status: "PROHIBITED" };
  }
  // Proceed with sandboxed and validated command execution if deemed safe
  // ... execute command ...
  return { success: true, output: "Command output..." };
}
```

This illustrates how a check similar to Mistral's safety guardrails would be implemented: pattern matching against potentially dangerous commands and triggering an incident response or outright blocking the command.

**All new tools must be reviewed for security implications before deployment.** 