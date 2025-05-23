# Physics Simulations Integration Guide for STEM AI Assistant

This document provides a comprehensive implementation guide for enhancing physics simulations visualization in the STEM AI Assistant project. The plan leverages the existing Matter.js infrastructure while following proven architectural patterns from the visualization tools system.

## 🎯 Implementation Objectives

1. **Enhance existing physics simulation capabilities** with advanced Matter.js features
2. **Implement sophisticated educational physics scenarios** beyond basic falling objects  
3. **Create LLM-driven dynamic scene generation** using structured JSON "sim-tokens"
4. **Optimize performance** with proven caching and lazy loading patterns
5. **Provide interactive controls** for real-time physics parameter manipulation

---

## 📊 Current State Analysis

### ✅ Already Implemented
- **Basic Matter.js integration** in `MatterSimulator.tsx` (162 lines)
- **Physics simulation tool** in `lib/ai/tools/physicsSimulationTool.ts` (55 lines)
- **Tool → Component architecture** following `tool_viz.md` patterns
- **Chat API integration** with Vercel AI SDK tools
- **Basic simulation types**: falling objects, pendulum, custom setups

### 🔧 Enhancement Opportunities  
- **Limited physics scenarios** - only 3 basic types currently supported
- **No interactive controls** - simulations run without user intervention
- **Basic visual representation** - default Matter.js styling only
- **No scene templates** - limited educational physics examples
- **No advanced physics** - springs, collisions, forces, constraints

---

## 🏗️ Phase 1: Enhanced Physics Simulation Tool

### Objective: Expand `physicsSimulationTool.ts` with comprehensive physics scenarios

**File to modify:** `lib/ai/tools/physicsSimulationTool.ts`

#### Enhanced Schema Design

```typescript
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
    // Objects in the simulation
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
    })).describe("Objects in the physics simulation"),
    
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
  }),
  
  // Simulation metadata
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    duration: z.number().positive().optional().default(10),
    timeScale: z.number().positive().optional().default(1),
    educational_context: z.string().optional(), // Physics concept being demonstrated
  }).optional(),
});
```

#### Predefined Physics Scenarios

```typescript
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
    }
  },
  
  spring_system: {
    title: "Spring-Mass System",
    description: "Simple harmonic motion with damping",
    simConfig: {
      objects: [
        { id: "mass", type: "ball", position: {x: 300, y: 300}, 
          dimensions: {radius: 15}, properties: {mass: 2} }
      ],
      constraints: [
        { type: "distance", pointA: {x: 300, y: 100}, objectB: "mass", 
          length: 150, stiffness: 0.002 }
      ]
    }
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
    }
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
    }
  }
};
```

---

## 🎨 Phase 2: Enhanced MatterSimulator Component

### Objective: Upgrade `MatterSimulator.tsx` with advanced features and interactive controls

**File to modify:** `components/visualizations/MatterSimulator.tsx`

#### Key Enhancements

1. **Interactive Controls**
   - Play/Pause/Reset simulation
   - Speed control (timeScale adjustment)
   - Real-time parameter modification
   - Scene statistics display

2. **Advanced Rendering**
   - Custom colors and styling for objects
   - Force visualization (arrows, field lines)
   - Trajectory trails for moving objects
   - Measurement tools (distance, velocity vectors)

3. **Global Physics Cache**
   - Cache pre-computed physics scenarios
   - Prevent duplicate simulation setups
   - Memory-efficient object reuse

#### Enhanced Component Structure

```typescript
interface EnhancedMatterSimulatorProps {
  simulationType: string;
  simConfig: {
    objects: PhysicsObject[];
    forces?: PhysicsForce[];
    constraints?: PhysicsConstraint[];
    environment?: EnvironmentSettings;
  };
  metadata?: {
    title?: string;
    description?: string;
    duration?: number;
    timeScale?: number;
    educational_context?: string;
  };
  interactive?: boolean; // Enable/disable controls
  showTrails?: boolean;  // Show object trajectories
  showForces?: boolean;  // Visualize force vectors
}

// Global cache for physics scenarios
const physicsScenarioCache = new Map<string, CachedPhysicsScene>();

// Performance optimization patterns from tool_viz.md
const renderedScenarios = new Set<string>();
```

#### Interactive Controls Implementation

```typescript
const PhysicsControls: React.FC<{
  engineRef: React.MutableRefObject<Matter.Engine | null>;
  runnerRef: React.MutableRefObject<Matter.Runner | null>;
  onReset: () => void;
  onParameterChange: (param: string, value: number) => void;
}> = ({ engineRef, runnerRef, onReset, onParameterChange }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [gravity, setGravity] = useState(1);

  const handlePlayPause = () => {
    if (runnerRef.current && engineRef.current) {
      if (isRunning) {
        Matter.Runner.stop(runnerRef.current);
      } else {
        Matter.Runner.run(runnerRef.current, engineRef.current);
      }
      setIsRunning(!isRunning);
    }
  };

  const handleTimeScaleChange = (value: number) => {
    if (engineRef.current) {
      engineRef.current.timing.timeScale = value;
      setTimeScale(value);
      onParameterChange('timeScale', value);
    }
  };

  return (
    <div className="physics-controls flex gap-2 mb-4 p-3 bg-gray-100 rounded">
      <button onClick={handlePlayPause} className="px-3 py-1 bg-blue-500 text-white rounded">
        {isRunning ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <button onClick={onReset} className="px-3 py-1 bg-red-500 text-white rounded">
        🔄 Reset
      </button>
      <div className="flex items-center gap-2">
        <label className="text-sm">Speed:</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={timeScale}
          onChange={(e) => handleTimeScaleChange(parseFloat(e.target.value))}
          className="w-20"
        />
        <span className="text-sm w-8">{timeScale}x</span>
      </div>
    </div>
  );
};
```

---

## 🧠 Phase 3: LLM Integration Enhancement

### Objective: Enhance AI-driven physics scene generation with natural language processing

**Files to modify:** 
- `app/api/chat/route.ts` (system prompt enhancement)
- `lib/ai/tools/physicsSimulationTool.ts` (execute function)

#### Enhanced System Prompt

```typescript
const physicsInstructions = `
For physics simulation requests, use the 'physicsSimulationTool' with these capabilities:

PREDEFINED SCENARIOS:
- "collision_demo" - Shows elastic/inelastic collisions with conservation of momentum
- "spring_system" - Demonstrates simple harmonic motion and damping
- "projectile_motion" - Parabolic trajectory under gravity
- "inclined_plane" - Forces and motion on angled surfaces
- "pendulum" - Simple pendulum with customizable length and initial angle
- "falling_objects" - Objects falling under gravity with different properties

CUSTOM PHYSICS SCENES:
For complex requests, create custom configurations with:
- Multiple objects (balls, boxes, polygons) with individual properties
- Forces (gravity, springs, drag) with specified strengths
- Constraints (distance, revolute, weld) between objects
- Environmental settings (gravity direction, air resistance, boundaries)

NATURAL LANGUAGE PARSING:
- "Two balls colliding" → collision_demo scenario
- "Mass on a spring" → spring_system scenario  
- "Ball rolling down a ramp" → inclined_plane scenario
- "Projectile launched at 45 degrees" → projectile_motion with custom velocity
- "Three pendulums of different lengths" → custom setup with multiple pendulum constraints

Always provide educational context in the metadata.educational_context field.
`;
```

#### Intelligent Scene Generation

```typescript
// Enhanced execute function in physicsSimulationTool.ts
execute: async (params: z.infer<typeof physicsSimulationToolSchema>) => {
  let finalConfig;
  
  // Use predefined templates for known scenarios
  if (PHYSICS_TEMPLATES[params.simulationType]) {
    finalConfig = {
      ...PHYSICS_TEMPLATES[params.simulationType],
      ...params.simConfig, // Allow overrides
      metadata: {
        ...PHYSICS_TEMPLATES[params.simulationType].metadata,
        ...params.metadata
      }
    };
  } else {
    // Custom configuration
    finalConfig = {
      simConfig: params.simConfig,
      metadata: params.metadata
    };
  }
  
  // Generate physics education context
  const educationalContext = generateEducationalContext(params.simulationType, finalConfig);
  
  return {
    simulationType: params.simulationType,
    simConfig: finalConfig.simConfig,
    metadata: {
      ...finalConfig.metadata,
      educational_context: educationalContext,
      timestamp: new Date().toISOString()
    },
    interactive: true, // Enable controls by default
    showTrails: shouldShowTrails(params.simulationType),
    showForces: shouldShowForces(params.simulationType)
  };
}

function generateEducationalContext(type: string, config: any): string {
  const contexts = {
    collision_demo: "This simulation demonstrates conservation of momentum. Watch how momentum is transferred between objects during collision.",
    spring_system: "Simple harmonic motion occurs when a restoring force is proportional to displacement. The spring provides this restoring force.",
    projectile_motion: "Projectile motion combines horizontal motion at constant velocity with vertical motion under constant acceleration due to gravity.",
    inclined_plane: "On an inclined plane, gravity can be resolved into components parallel and perpendicular to the surface.",
    // ... more contexts
  };
  
  return contexts[type] || `Physics simulation demonstrating ${type.replace(/_/g, ' ')} principles.`;
}
```

---

## ⚡ Phase 4: Performance Optimization

### Objective: Implement advanced performance optimizations following `tool_viz.md` patterns

#### Global Physics Scene Cache

```typescript
// In MatterSimulator.tsx
interface CachedPhysicsScene {
  engineData: any; // Serialized Matter.js world state
  timestamp: number;
  configHash: string;
  renderingOptions: {
    interactive: boolean;
    showTrails: boolean;
    showForces: boolean;
  };
}

const physicsScenarioCache = new Map<string, CachedPhysicsScene>();
const MAX_CACHE_SIZE = 50; // Limit memory usage

function createSceneCacheKey(simulationType: string, simConfig: any, metadata: any): string {
  return `${simulationType}:${JSON.stringify(simConfig)}:${JSON.stringify(metadata)}`;
}

function cachePhysicsScene(key: string, engineData: any, options: any) {
  // Implement LRU eviction if cache is full
  if (physicsScenarioCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(physicsScenarioCache.keys())[0];
    physicsScenarioCache.delete(oldestKey);
  }
  
  physicsScenarioCache.set(key, {
    engineData,
    timestamp: Date.now(),
    configHash: key,
    renderingOptions: options
  });
}
```

#### Lazy Loading & Viewport Optimization

```typescript
// Intersection Observer for performance
const useViewportOptimization = (containerRef: RefObject<HTMLDivElement>) => {
  const [isInViewport, setIsInViewport] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [containerRef]);
  
  return isInViewport;
};

// In MatterSimulator component
const isInViewport = useViewportOptimization(sceneRef);

useEffect(() => {
  if (!isInViewport && runnerRef.current) {
    // Pause simulation when out of viewport
    Matter.Runner.stop(runnerRef.current);
  } else if (isInViewport && engineRef.current && !runnerRef.current) {
    // Resume when back in viewport
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engineRef.current);
  }
}, [isInViewport]);
```

#### Memory Management

```typescript
// Cleanup function with proper resource management
const cleanupSimulation = useCallback(() => {
  if (renderRef.current) {
    Matter.Render.stop(renderRef.current);
    if (renderRef.current.canvas) {
      renderRef.current.canvas.remove();
    }
  }
  
  if (runnerRef.current) {
    Matter.Runner.stop(runnerRef.current);
  }
  
  if (engineRef.current) {
    // Clear all bodies and constraints
    Matter.World.clear(engineRef.current.world, false);
    Matter.Engine.clear(engineRef.current);
  }
  
  // Clear refs
  engineRef.current = null;
  renderRef.current = null;
  runnerRef.current = null;
}, []);

// Auto-cleanup on unmount and dependency changes
useEffect(() => {
  return cleanupSimulation;
}, [cleanupSimulation]);
```

---

## 🎯 Phase 5: Educational Integration & UI Enhancement

### Objective: Create comprehensive educational physics interface

#### Physics Concept Browser

```typescript
// New component: PhysicsConceptBrowser.tsx
const PhysicsConceptBrowser: React.FC = () => {
  const concepts = [
    {
      category: "Mechanics",
      scenarios: ["falling_objects", "collision_demo", "inclined_plane", "projectile_motion"]
    },
    {
      category: "Oscillations",
      scenarios: ["pendulum", "spring_system", "oscillator_coupled"]
    },
    {
      category: "Waves & Fluids", 
      scenarios: ["wave_motion", "fluid_dynamics"]
    }
  ];
  
  return (
    <div className="physics-browser grid grid-cols-3 gap-4 p-4">
      {concepts.map(category => (
        <div key={category.category} className="category-card">
          <h3 className="font-bold mb-2">{category.category}</h3>
          {category.scenarios.map(scenario => (
            <PhysicsScenarioCard key={scenario} scenario={scenario} />
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### Advanced Measurement Tools

```typescript
// Real-time physics measurements
const PhysicsMeasurements: React.FC<{
  engine: Matter.Engine | null;
  selectedObject?: string;
}> = ({ engine, selectedObject }) => {
  const [measurements, setMeasurements] = useState({
    kinetic_energy: 0,
    potential_energy: 0,
    momentum: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    position: { x: 0, y: 0 }
  });
  
  useEffect(() => {
    if (!engine || !selectedObject) return;
    
    const updateMeasurements = () => {
      const body = engine.world.bodies.find(b => b.label === selectedObject);
      if (body) {
        const ke = 0.5 * body.mass * (body.velocity.x ** 2 + body.velocity.y ** 2);
        const pe = body.mass * Math.abs(engine.gravity.y) * (400 - body.position.y); // Assuming height reference
        
        setMeasurements({
          kinetic_energy: ke,
          potential_energy: pe,
          momentum: { 
            x: body.mass * body.velocity.x, 
            y: body.mass * body.velocity.y 
          },
          velocity: body.velocity,
          position: body.position
        });
      }
    };
    
    const interval = setInterval(updateMeasurements, 100);
    return () => clearInterval(interval);
  }, [engine, selectedObject]);
  
  return (
    <div className="measurements-panel bg-gray-100 p-3 rounded">
      <h4 className="font-semibold mb-2">Physics Measurements</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>KE: {measurements.kinetic_energy.toFixed(2)} J</div>
        <div>PE: {measurements.potential_energy.toFixed(2)} J</div>
        <div>Momentum: ({measurements.momentum.x.toFixed(1)}, {measurements.momentum.y.toFixed(1)})</div>
        <div>Velocity: ({measurements.velocity.x.toFixed(1)}, {measurements.velocity.y.toFixed(1)})</div>
      </div>
    </div>
  );
};
```

---

## 📚 Implementation Roadmap

### Foundation Enhancement
- [ ] Expand `physicsSimulationToolSchema` with comprehensive physics scenarios
- [ ] Implement predefined physics templates (collision, spring, projectile, etc.)
- [ ] Add intelligent scene generation logic to tool execute function
- [ ] Test basic enhanced scenarios through chat interface

### Component Enhancement  
- [ ] Upgrade `MatterSimulator.tsx` with interactive controls
- [ ] Implement global physics scene caching
- [ ] Add advanced rendering features (trails, force visualization)
- [ ] Create measurement tools and real-time physics calculations

### Performance & Polish
- [ ] Implement viewport optimization with IntersectionObserver
- [ ] Add memory management and proper cleanup
- [ ] Create physics concept browser interface
- [ ] Add educational context generation and display

###  Integration & Testing
- [ ] Enhanced LLM prompt engineering for natural language physics
- [ ] Comprehensive testing of all physics scenarios
- [ ] Performance optimization and edge case handling
- [ ] Documentation and usage examples

---

## 🧪 Testing Strategy

### Physics Accuracy Testing
```javascript
// Unit tests for physics calculations
describe('Physics Calculations', () => {
  test('Conservation of momentum in collisions', () => {
    // Test elastic collision momentum conservation
  });
  
  test('Simple harmonic motion period calculation', () => {
    // Test spring system period T = 2π√(m/k)
  });
  
  test('Projectile motion trajectory', () => {
    // Test parabolic path calculations
  });
});
```

### Performance Testing
```javascript
describe('Performance Optimization', () => {
  test('Scene caching prevents duplicate setup', () => {
    // Verify cache hit rates and memory usage
  });
  
  test('Viewport optimization pauses out-of-view simulations', () => {
    // Test IntersectionObserver behavior
  });
  
  test('Memory cleanup prevents leaks', () => {
    // Test proper Matter.js cleanup
  });
});
```

---

## 🔮 Future Enhancements

### Advanced Physics Features
- **3D Physics** - Integration with Cannon.js or Rapier for 3D simulations
- **Soft Body Physics** - Deformable objects and cloth simulation
- **Particle Systems** - Gas dynamics and fluid simulation
- **Electromagnetic Fields** - Charged particle motion in fields

### Educational Improvements
- **Guided Tutorials** - Step-by-step physics concept exploration
- **Problem Solving Mode** - Interactive physics problem sets
- **Data Export** - CSV export of simulation data for analysis
- **VR/AR Support** - Immersive physics education experiences

---

## 📋 Summary

This implementation guide provides a comprehensive roadmap for enhancing physics simulations in the STEM AI Assistant. By leveraging the existing Matter.js infrastructure and following proven architectural patterns, we can create a powerful educational physics platform that:

- **Builds on proven foundations** - Uses established tool → component architecture
- **Provides rich educational content** - Comprehensive physics scenarios with educational context
- **Optimizes performance** - Global caching, viewport optimization, and memory management
- **Enables natural interaction** - LLM-driven scene generation from natural language
- **Supports real-time exploration** - Interactive controls and measurement tools

The phased implementation approach ensures steady progress while maintaining system stability and following best practices established in the existing codebase.

---

## 🧪 Piano di sviluppo – Simulazioni fisiche interattive con LLM & Matter.js

### 🎯 Obiettivo

Creare un sistema educativo interattivo in cui l'utente descrive un problema fisico, e un modello LLM genera una scena simulabile in tempo reale tramite Matter.js.

---

## 🔹 Fase 1: Setup e Integrazione iniziale (ottimizzata)

* Integrazione di Matter.js nel sito con **caricamento asincrono** e attivazione solo su richiesta.
* Ottimizzazione canvas: risoluzione adeguata, animazione sospesa fuori viewport.

---

## 🔹 Fase 2: Costruzione dinamica degli ambienti fisici

### ✅ Introduzione del **"sim-token"** (JSON)

* Definisce oggetti, forze, vincoli e proprietà ambientali.
* Struttura chiara e limitata per evitare ambiguità.

**Esempio JSON:**

```json
{
  "objects": [
    { "type": "ball", "radius": 15, "mass": 1, "position": [100, 200], "velocity": [5, -3] }
  ],
  "constraints": [],
  "environment": {
    "gravity": [0, 1],
    "ground": true
  }
}
```

### 🔧 Parser Matter.js

* Funzione `loadSceneFromToken(json)` che crea dinamicamente corpi, forze e vincoli.
* Separazione tra logica di parsing e rendering.

---

## 🔹 Fase 3: Esperimenti base precostituiti (fallback educativo)

* Moto uniformemente accelerato
* Urti elastici/inelastici
* Pendolo semplice
* Oscillatore armonico
* Molecola 2D con vincoli

> **Nota**: Tutti questi possono essere **generati anch'essi via JSON**, rendendoli compatibili con la pipeline dinamica.

---

## 🔹 Fase 4: Integrazione LLM

### 🎤 Interazione

* L'utente scrive un problema (es. "un oggetto che cade da 5 metri e rimbalza").
* LLM genera un JSON valido secondo lo schema.
* L'interfaccia carica la simulazione con `loadSceneFromToken()`.

### ✨ Prompt Engineering

* Addestra la LLM con esempi di input → output JSON.
* Può anche supportare input parametrici semplificati (`ballistic_motion(v0=10, angle=30)`).

---

## 🔹 Fase 5: Interfaccia utente

* Selezione esperimento (preset o descrizione libera)
* Slider per parametri base
* Pulsanti start/stop/reset
* Esportazione JSON del token generato

---

## ⚙️ Ottimizzazioni prestazionali

| Strategia            | Azione                                                   |
| -------------------- | -------------------------------------------------------- |
| Lazy loading         | Carica Matter.js solo quando richiesto                   |
| Pausa fuori viewport | Usa `IntersectionObserver` per fermare `Engine.update()` |
| Oggetti limitati     | Max 5–10 dinamici a scena                                |
| UI leggera           | Sidebar CSS o tweakpane, niente React                    |

---

## ✅ Riepilogo finale

| Fase | Obiettivo        | Focus                               |
| ---- | ---------------- | ----------------------------------- |
| 1    | Setup leggero    | Ottimizzazione rendering e carico   |
| 2    | Sim-token        | JSON per scene personalizzate       |
| 3    | Esperimenti base | Educazione + fallback               |
| 4    | LLM → JSON       | Generazione dinamica delle scene    |
| 5    | UI minima        | Controlli esperimento + editor JSON |

---


