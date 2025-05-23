import { z } from 'zod';

export const physicsSimulationToolSchema = z.object({
  simulationType: z.enum(['falling_objects', 'pendulum', 'custom_matter_js_setup']).describe("Type of physics simulation to run."),
  // Example for falling_objects or pendulum. More complex types might need a flexible 'customSetup' field.
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
    // Specific to pendulum
    pendulumLength: z.number().positive().optional().describe("Length of the pendulum."),
    initialAngle: z.number().optional().describe("Initial angle of the pendulum in degrees."),
    // For custom_matter_js_setup, this might be more free-form or expect a stringified JSON for Matter.js entities
    customSetupInstructions: z.string().optional().describe("Detailed instructions or JSON configuration for a custom Matter.js scene.")
  }).describe("Initial conditions for the simulation."),
  constants: z.object({
    gravity: z.object({ x: z.number(), y: z.number() }).optional().default({ x: 0, y: 1 }), // Typical Matter.js gravity (y positive is down)
    timeScale: z.number().positive().optional().default(1)
  }).optional().describe("Physical constants or simulation parameters."),
  simulationDuration: z.number().positive().optional().default(10).describe("Suggested duration for the simulation in seconds."),
  title: z.string().optional().describe("Optional title for the simulation visualization.")
});

export const physicsSimulationTool = {
  name: 'physicsSimulationTool',
  description: 'Generates parameters for running and visualizing 2D physics simulations using Matter.js. Use this for requests involving falling objects, collisions, pendulums, etc.',
  parameters: physicsSimulationToolSchema,
  execute: async (params: z.infer<typeof physicsSimulationToolSchema>) => {
    console.log('physicsSimulationTool executed with:', params);

    let specificDetails = "";
    if (params.simulationType === 'falling_objects' && params.initialConditions.objects) {
      specificDetails = `Involves ${params.initialConditions.objects.length} object(s).`;
    } else if (params.simulationType === 'pendulum') {
      specificDetails = `Pendulum length: ${params.initialConditions.pendulumLength || 'N/A'}, initial angle: ${params.initialConditions.initialAngle || 'N/A'} degrees.`;
    } else if (params.simulationType === 'custom_matter_js_setup') {
      specificDetails = "Custom setup instructions provided.";
    }

    const description = `Physics simulation: '${params.title || params.simulationType}'. Type: ${params.simulationType}. ${specificDetails} Duration: ${params.simulationDuration}s.`;

    return {
      vizType: 'matterjs',
      params: params, // Pass all validated params to the frontend
      description: description
    };
  }
}; 