import { z } from 'zod';

// Enhanced schema design from phys_tool.md plan
export const physicsSimulationToolSchema = z.object({
  simulationType: z.enum([
    'falling_objects',
    'pendulum', 
    'collision_demo',
    'spring_system',
    'inclined_plane',
    'circular_motion',
    'wave_motion',
    'projectile_motion',
    'oscillator_coupled',
    'fluid_dynamics',
    'custom_matter_js_setup'
  ]).describe("Type of physics simulation to run"),
  
  // Structured simulation configuration
  simConfig: z.object({
    // Objects in the simulation - MADE OPTIONAL for predefined scenarios
    objects: z.array(z.object({
      id: z.string().optional(),
      type: z.enum(['ball', 'box', 'polygon', 'rope', 'spring']),
      position: z.object({ x: z.number(), y: z.number() }),
      velocity: z.object({ x: z.number(), y: z.number() }).optional().default({x: 0, y: 0}),
      dimensions: z.object({
        radius: z.number().positive().optional(),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        sides: z.number().int().min(3).optional(), // For polygons
      }).optional(),
      properties: z.object({
        mass: z.number().positive().optional().default(1),
        restitution: z.number().min(0).max(1).optional().default(0.8),
        friction: z.number().min(0).optional().default(0.1),
        color: z.string().optional(),
        isStatic: z.boolean().optional().default(false),
      }).optional(),
    })).optional().describe("Objects in the physics simulation (optional for predefined scenarios)"),
    
    // Forces and constraints
    forces: z.array(z.object({
      type: z.enum(['gravity', 'spring', 'magnetic', 'friction', 'drag']),
      strength: z.number(),
      direction: z.object({ x: z.number(), y: z.number() }).optional(),
      attachedTo: z.array(z.string()).optional(), // Object IDs
    })).optional(),
    
    constraints: z.array(z.object({
      type: z.enum(['distance', 'point', 'revolute', 'weld']),
      objectA: z.string().optional(), // Object ID
      objectB: z.string().optional(), // Object ID
      pointA: z.object({ x: z.number(), y: z.number() }).optional(),
      pointB: z.object({ x: z.number(), y: z.number() }).optional(),
      length: z.number().optional(),
      stiffness: z.number().min(0).max(1).optional().default(0.9),
    })).optional(),
    
    // Environment settings
    environment: z.object({
      gravity: z.object({ x: z.number(), y: z.number() }).optional().default({ x: 0, y: 1 }),
      airResistance: z.number().min(0).max(1).optional().default(0),
      boundaries: z.object({
        ground: z.boolean().optional().default(true),
        walls: z.boolean().optional().default(true),
        ceiling: z.boolean().optional().default(false),
      }).optional(),
    }).optional(),
  }).optional().default({}),
  
  // Simulation metadata
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    duration: z.number().positive().optional().default(10),
    timeScale: z.number().positive().optional().default(1),
    educational_context: z.string().optional(), // Physics concept being demonstrated
  }).optional(),
});

// Predefined Physics Scenarios from phys_tool.md plan
const PHYSICS_TEMPLATES = {
  collision_demo: {
    title: "Elastic vs Inelastic Collisions",
    description: "Demonstrates conservation of momentum in different collision types",
    simConfig: {
      objects: [
        { id: "ball1", type: "ball", position: {x: 100, y: 200}, velocity: {x: 2, y: 0}, 
          dimensions: {radius: 20}, properties: {mass: 1, restitution: 0.9, color: "#ff6b6b"} },
        { id: "ball2", type: "ball", position: {x: 300, y: 200}, velocity: {x: -1, y: 0}, 
          dimensions: {radius: 25}, properties: {mass: 1.5, restitution: 0.9, color: "#4ecdc4"} }
      ],
      environment: { gravity: {x: 0, y: 0.1} }
    },
    educational_context: "This simulation demonstrates conservation of momentum. Watch how momentum is transferred between objects during collision."
  },
  
  spring_system: {
    title: "Spring-Mass System",
    description: "Simple harmonic motion with damping",
    simConfig: {
      objects: [
        { id: "mass", type: "ball", position: {x: 300, y: 300}, 
          dimensions: {radius: 15}, properties: {mass: 2, color: "#9b59b6"} }
      ],
      constraints: [
        { type: "distance", pointA: {x: 300, y: 100}, objectB: "mass", 
          length: 150, stiffness: 0.002 }
      ]
    },
    educational_context: "Simple harmonic motion occurs when a restoring force is proportional to displacement. The spring provides this restoring force."
  },
  
  projectile_motion: {
    title: "Projectile Motion",
    description: "Demonstrates parabolic trajectory under gravity",
    simConfig: {
      objects: [
        { id: "projectile", type: "ball", position: {x: 50, y: 400}, 
          velocity: {x: 5, y: -8}, dimensions: {radius: 10}, 
          properties: {mass: 0.5, color: "#ffd93d"} }
      ],
      environment: { gravity: {x: 0, y: 0.98}, airResistance: 0.001 }
    },
    educational_context: "Projectile motion combines horizontal motion at constant velocity with vertical motion under constant acceleration due to gravity."
  },
  
  inclined_plane: {
    title: "Motion on Inclined Plane", 
    description: "Demonstrates forces on an inclined surface",
    simConfig: {
      objects: [
        { id: "plane", type: "box", position: {x: 300, y: 350}, 
          dimensions: {width: 200, height: 20}, 
          properties: {isStatic: true, color: "#8e44ad"} },
        { id: "block", type: "box", position: {x: 250, y: 300}, 
          dimensions: {width: 20, height: 20}, 
          properties: {mass: 1, friction: 0.3, color: "#e74c3c"} }
      ]
    },
    educational_context: "On an inclined plane, gravity can be resolved into components parallel and perpendicular to the surface."
  }
};

// Educational context generation
function generateEducationalContext(type: string, config: any): string {
  const contexts = {
    collision_demo: "This simulation demonstrates conservation of momentum. Watch how momentum is transferred between objects during collision.",
    spring_system: "Simple harmonic motion occurs when a restoring force is proportional to displacement. The spring provides this restoring force.",
    projectile_motion: "Projectile motion combines horizontal motion at constant velocity with vertical motion under constant acceleration due to gravity.",
    inclined_plane: "On an inclined plane, gravity can be resolved into components parallel and perpendicular to the surface.",
    pendulum: "A pendulum demonstrates simple harmonic motion under the influence of gravity and tension forces.",
    falling_objects: "Objects falling under gravity demonstrate uniform acceleration and energy conservation principles.",
    circular_motion: "Circular motion requires centripetal force to maintain the curved path, demonstrating Newton's laws of motion.",
    wave_motion: "Wave motion shows how energy transfers through a medium without transferring matter.",
    oscillator_coupled: "Coupled oscillators demonstrate energy transfer between connected oscillating systems.",
    fluid_dynamics: "Fluid dynamics shows how liquids and gases behave under various forces and constraints."
  };
  
  return contexts[type as keyof typeof contexts] || `Physics simulation demonstrating ${type.replace(/_/g, ' ')} principles.`;
}

// Helper functions for visualization features
function shouldShowTrails(type: string): boolean {
  return ['projectile_motion', 'circular_motion', 'wave_motion'].includes(type);
}

function shouldShowForces(type: string): boolean {
  return ['inclined_plane', 'spring_system', 'collision_demo'].includes(type);
}

// Enhanced execute function with template logic
export const physicsSimulationTool = {
  name: 'physicsSimulationTool',
  description: 'Generates parameters for running and visualizing 2D physics simulations using Matter.js. Use this for requests involving falling objects, collisions, pendulums, springs, projectiles, and other physics concepts.',
  parameters: physicsSimulationToolSchema,
  execute: async (params: z.infer<typeof physicsSimulationToolSchema>) => {
    console.log('Enhanced physicsSimulationTool executed with:', params);

    let finalConfig;
    let educationalContext;
    
    // Use predefined templates for known scenarios
    if (PHYSICS_TEMPLATES[params.simulationType as keyof typeof PHYSICS_TEMPLATES]) {
      const template = PHYSICS_TEMPLATES[params.simulationType as keyof typeof PHYSICS_TEMPLATES];
      
      // Safe merge template simConfig with provided simConfig
      const templateSimConfig = template.simConfig || {};
      const providedSimConfig = params.simConfig || {};
      
      const mergedSimConfig = {
        objects: providedSimConfig.objects || (templateSimConfig as any).objects || [],
        forces: providedSimConfig.forces || (templateSimConfig as any).forces || undefined,
        constraints: providedSimConfig.constraints || (templateSimConfig as any).constraints || undefined,
        environment: {
          ...(templateSimConfig as any).environment,
          ...providedSimConfig.environment
        }
      };
      
      // Remove undefined fields
      if (!mergedSimConfig.forces) delete mergedSimConfig.forces;
      if (!mergedSimConfig.constraints) delete mergedSimConfig.constraints;
      
      finalConfig = {
        title: params.metadata?.title || template.title,
        description: params.metadata?.description || template.description,
        simConfig: mergedSimConfig,
        metadata: {
          title: params.metadata?.title || template.title,
          description: params.metadata?.description || template.description,
          duration: params.metadata?.duration || 10,
          timeScale: params.metadata?.timeScale || 1,
          educational_context: params.metadata?.educational_context || template.educational_context
        }
      };
      educationalContext = template.educational_context;
    } else {
      // Custom configuration or legacy support
      finalConfig = {
        simConfig: params.simConfig || {},
        metadata: params.metadata || {},
        title: params.metadata?.title || params.simulationType.replace(/_/g, ' '),
        description: params.metadata?.description || `Physics simulation of ${params.simulationType}`
      };
      educationalContext = generateEducationalContext(params.simulationType, finalConfig);
    }
    
    // Generate final result with enhanced features
    const result = {
      simulationType: params.simulationType,
      simConfig: finalConfig.simConfig,
      metadata: {
        ...finalConfig.metadata,
        educational_context: educationalContext,
        timestamp: new Date().toISOString()
      },
      interactive: true, // Enable controls by default
      showTrails: shouldShowTrails(params.simulationType),
      showForces: shouldShowForces(params.simulationType),
      // Legacy compatibility fields
      initialConditions: finalConfig.simConfig, // For backwards compatibility
      constants: finalConfig.simConfig?.environment, // For backwards compatibility
      title: finalConfig.title || finalConfig.metadata?.title,
      description: finalConfig.description || finalConfig.metadata?.description
    };

    console.log('Enhanced physicsSimulationTool result:', result);
    
    return {
      vizType: 'matterjs',
      params: result,
      description: `Enhanced physics simulation: ${result.metadata?.title || params.simulationType}. ${result.metadata?.educational_context || ''}`
    };
  }
}; 