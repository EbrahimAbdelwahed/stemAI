'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Card } from './Card';
import { Typography } from './Typography';
import { useGameOfLife } from '../../contexts/GameOfLifeContext';

interface GameOfLifeProps {
  width?: number;
  height?: number;
  className?: string;
}

export function GameOfLife({ width = 800, height = 500, className }: GameOfLifeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Use global game state
  const { state, actions } = useGameOfLife();
  const { cells, generation, isRunning, viewport } = state;
  const { togglePause, reset, setViewport } = actions;

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
    
    setViewport({
      ...viewport,
      x: viewport.x + deltaX,
      y: viewport.y + deltaY
    });
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, [viewport, setViewport]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(2, Math.min(20, viewport.zoom * delta));
    
    setViewport({
      ...viewport,
      zoom: newZoom
    });
  }, [viewport, setViewport]);

  return (
    <Card className={`bg-black border-green-500/20 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography variant="h3" className="text-green-400 font-mono">
              Conway&apos;s Game of Life
            </Typography>
            <Typography variant="small" className="text-green-300/70 font-mono">
              Generation: {generation} | Cells: {cells.size} | {isRunning ? 'RUNNING' : 'PAUSED'}
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
            Drag to pan • Scroll to zoom • Persistent across sessions
          </div>
        </div>
      </div>
    </Card>
  );
} 