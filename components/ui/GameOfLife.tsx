'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from './Card';
import { Typography } from './Typography';

interface GameOfLifeProps {
  width?: number;
  height?: number;
  className?: string;
}

interface ViewPort {
  x: number;
  y: number;
  zoom: number;
}

export function GameOfLife({ width = 800, height = 500, className }: GameOfLifeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Game state
  const [cells, setCells] = useState<Set<string>>(new Set());
  const [generation, setGeneration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [viewport, setViewport] = useState<ViewPort>({ x: 0, y: 0, zoom: 8 });
  
  // Game of Life rules
  const getNeighbors = useCallback((x: number, y: number): string[] => {
    const neighbors: string[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        neighbors.push(`${x + dx},${y + dy}`);
      }
    }
    return neighbors;
  }, []);

  const getAliveNeighborCount = useCallback((x: number, y: number, cellSet: Set<string>): number => {
    return getNeighbors(x, y).filter(key => cellSet.has(key)).length;
  }, [getNeighbors]);

  const nextGeneration = useCallback((currentCells: Set<string>): Set<string> => {
    const newCells = new Set<string>();
    const cellsToCheck = new Set<string>();

    // Add all current cells and their neighbors to check
    for (const cellKey of currentCells) {
      const [x, y] = cellKey.split(',').map(Number);
      cellsToCheck.add(cellKey);
      getNeighbors(x, y).forEach(neighbor => cellsToCheck.add(neighbor));
    }

    // Apply Conway's rules
    for (const cellKey of cellsToCheck) {
      const [x, y] = cellKey.split(',').map(Number);
      const aliveNeighbors = getAliveNeighborCount(x, y, currentCells);
      const isAlive = currentCells.has(cellKey);

      if (isAlive && (aliveNeighbors === 2 || aliveNeighbors === 3)) {
        newCells.add(cellKey);
      } else if (!isAlive && aliveNeighbors === 3) {
        newCells.add(cellKey);
      }
    }

    return newCells;
  }, [getAliveNeighborCount, getNeighbors]);

  // Initialize with interesting patterns
  const initializePatterns = useCallback(() => {
    const initialCells = new Set<string>();
    
    // Glider
    const glider = [
      [1, 0], [2, 1], [0, 2], [1, 2], [2, 2]
    ];
    glider.forEach(([x, y]) => initialCells.add(`${x},${y}`));
    
    // Lightweight spaceship (LWSS)
    const lwss = [
      [15, 5], [16, 5], [17, 5], [18, 5], [14, 6], [18, 6], [18, 7], [14, 8], [17, 8]
    ];
    lwss.forEach(([x, y]) => initialCells.add(`${x},${y}`));
    
    // Pulsar (period 3 oscillator)
    const pulsar = [
      // Top part
      [25, 10], [26, 10], [27, 10], [31, 10], [32, 10], [33, 10],
      [23, 12], [28, 12], [30, 12], [35, 12],
      [23, 13], [28, 13], [30, 13], [35, 13],
      [23, 14], [28, 14], [30, 14], [35, 14],
      [25, 15], [26, 15], [27, 15], [31, 15], [32, 15], [33, 15],
      // Bottom part (mirrored)
      [25, 17], [26, 17], [27, 17], [31, 17], [32, 17], [33, 17],
      [23, 18], [28, 18], [30, 18], [35, 18],
      [23, 19], [28, 19], [30, 19], [35, 19],
      [23, 20], [28, 20], [30, 20], [35, 20],
      [25, 22], [26, 22], [27, 22], [31, 22], [32, 22], [33, 22]
    ];
    pulsar.forEach(([x, y]) => initialCells.add(`${x},${y}`));
    
    return initialCells;
  }, []);

  // Initialize game
  useEffect(() => {
    setCells(initializePatterns());
  }, [initializePatterns]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = (currentTime: number) => {
      if (currentTime - lastUpdateTimeRef.current >= 200) { // 200ms between generations
        setCells(prev => {
          const next = nextGeneration(prev);
          setGeneration(g => g + 1);
          return next;
        });
        lastUpdateTimeRef.current = currentTime;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, nextGeneration]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Calculate cell size based on zoom
    const cellSize = viewport.zoom;
    const offsetX = viewport.x;
    const offsetY = viewport.y;

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#001100';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = -offsetX % cellSize; x < width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -offsetY % cellSize; y < height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw living cells
    ctx.fillStyle = '#00ff00'; // Terminal green
    for (const cellKey of cells) {
      const [x, y] = cellKey.split(',').map(Number);
      const screenX = x * cellSize + offsetX;
      const screenY = y * cellSize + offsetY;
      
      // Only draw cells that are visible
      if (screenX >= -cellSize && screenX < width && screenY >= -cellSize && screenY < height) {
        ctx.fillRect(screenX, screenY, cellSize - 1, cellSize - 1);
      }
    }

  }, [cells, viewport, width, height]);

  // Mouse handlers for pan and zoom
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    
    setViewport(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(2, Math.min(20, viewport.zoom * delta));
    
    setViewport(prev => ({
      ...prev,
      zoom: newZoom
    }));
  }, [viewport.zoom]);

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setCells(initializePatterns());
    setGeneration(0);
    setViewport({ x: 0, y: 0, zoom: 8 });
  };

  return (
    <Card className={`bg-black border-green-500/20 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography variant="h3" className="text-green-400 font-mono">
              Conway&apos;s Game of Life
            </Typography>
            <Typography variant="small" className="text-green-300/70 font-mono">
              Generation: {generation} | Cells: {cells.size}
            </Typography>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={togglePause}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-mono text-sm hover:bg-green-500/30 transition-colors"
            >
              {isRunning ? 'PAUSE' : 'RUN'}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-mono text-sm hover:bg-green-500/30 transition-colors"
            >
              RESET
            </button>
          </div>
        </div>
        
        <div className="relative bg-black border border-green-500/30 rounded">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          <div className="absolute bottom-2 left-2 text-green-300/50 font-mono text-xs">
            Drag to pan • Scroll to zoom
          </div>
        </div>
      </div>
    </Card>
  );
} 