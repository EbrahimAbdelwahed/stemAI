'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export interface MatterSimulatorProps {
  simulationType: 'falling_objects' | 'pendulum' | 'custom_matter_js_setup';
  initialConditions: {
    objects?: Array<{
      shape?: 'circle' | 'rectangle';
      position: { x: number; y: number };
      velocity?: { x: number; y: number };
      mass?: number;
      radius?: number;
      width?: number;
      height?: number;
      options?: any; // Matter.js Body options
    }>;
    pendulumLength?: number;
    initialAngle?: number;
    customSetupInstructions?: string;
  };
  constants?: {
    gravity?: { x: number; y: number };
    timeScale?: number;
  };
  simulationDuration?: number; // Primarily for LLM guidance, simulation runs until stopped
  title?: string;
  description?: string;
}

const MatterSimulator: React.FC<MatterSimulatorProps> = ({
  simulationType,
  initialConditions,
  constants,
  title,
  description
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !sceneRef.current) return;

    const cw = sceneRef.current.clientWidth;
    const ch = sceneRef.current.clientHeight || 500; // Default height if not set

    // Ensure Matter.js is only initialized once or cleaned up properly
    if (engineRef.current) {
        Matter.Render.stop(renderRef.current!);
        Matter.Runner.stop(runnerRef.current!);
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
        renderRef.current!.canvas.remove();
    }

    const engine = Matter.Engine.create();
    engineRef.current = engine;
    if (constants?.gravity) {
      engine.gravity.x = constants.gravity.x;
      engine.gravity.y = constants.gravity.y;
    }
    if (constants?.timeScale) {
      engine.timing.timeScale = constants.timeScale;
    }

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: '#f0f0f0'
      }
    });
    renderRef.current = render;

    // Ground and walls
    const ground = Matter.Bodies.rectangle(cw / 2, ch - 25, cw, 50, { isStatic: true });
    const wallLeft = Matter.Bodies.rectangle(0, ch / 2, 50, ch, { isStatic: true });
    const wallRight = Matter.Bodies.rectangle(cw, ch / 2, 50, ch, { isStatic: true });
    Matter.World.add(engine.world, [ground, wallLeft, wallRight]);

    // Add objects based on simulationType
    if (simulationType === 'falling_objects' && initialConditions.objects) {
      initialConditions.objects.forEach(obj => {
        let body;
        const bodyOptions = { 
            restitution: 0.8, 
            friction: 0.1, 
            mass: obj.mass || 1,
            ...(obj.options || {})
        };
        if (obj.shape === 'rectangle') {
          body = Matter.Bodies.rectangle(obj.position.x, obj.position.y, obj.width || 50, obj.height || 50, bodyOptions);
        } else { // Default to circle
          body = Matter.Bodies.circle(obj.position.x, obj.position.y, obj.radius || 25, bodyOptions);
        }
        if (obj.velocity) {
          Matter.Body.setVelocity(body, obj.velocity);
        }
        Matter.World.add(engine.world, body);
      });
    } else if (simulationType === 'pendulum') {
      const pendulumLength = initialConditions.pendulumLength || 200;
      const initialAngleRad = ((initialConditions.initialAngle || 0) * Math.PI) / 180;
      const pivotX = cw / 2;
      const pivotY = ch / 4;
      const bobRadius = 30;
      const bob = Matter.Bodies.circle(pivotX + pendulumLength * Math.sin(initialAngleRad), pivotY + pendulumLength * Math.cos(initialAngleRad), bobRadius, { mass: 5, restitution: 0.6 });
      const constraint = Matter.Constraint.create({
        pointA: { x: pivotX, y: pivotY },
        bodyB: bob,
        length: pendulumLength,
        stiffness: 0.9
      });
      Matter.World.add(engine.world, [bob, constraint]);
    } else if (simulationType === 'custom_matter_js_setup') {
      // Basic: Log instructions. Advanced: parse JSON for bodies/constraints
      console.warn('Custom Matter.js setup instructions:', initialConditions.customSetupInstructions);
      // For a real implementation, you'd parse customSetupInstructions here.
      // For now, we can add a default object or leave it empty based on instructions content.
       if (!initialConditions.customSetupInstructions?.trim()){
            const customObj = Matter.Bodies.polygon(cw / 2, ch / 3, 5, 40, { mass: 2 }); // Example object
            Matter.World.add(engine.world, customObj);
       }
    }

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    return () => {
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
        if (renderRef.current?.canvas) {
            renderRef.current.canvas.remove();
        }
      }
      engineRef.current = null;
      renderRef.current = null;
      runnerRef.current = null;
    };
  }, [simulationType, initialConditions, constants, typeof window !== 'undefined' ? sceneRef.current?.clientWidth : 0]); // Re-run if props change, or width changes

  return (
    <div className="my-4 p-4 border rounded-lg shadow">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      <div ref={sceneRef} style={{ width: '100%', height: '500px', position: 'relative' }} />
    </div>
  );
};

export default MatterSimulator; 