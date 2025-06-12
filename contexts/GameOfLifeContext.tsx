'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface GameOfLifeState {
  cells: Set<string>;
  generation: number;
  isRunning: boolean;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

interface GameOfLifeContextType {
  state: GameOfLifeState;
  actions: {
    togglePause: () => void;
    reset: () => void;
    setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  };
}

const GameOfLifeContext = createContext<GameOfLifeContextType | null>(null);

const STORAGE_KEY = 'conway-game-of-life-state';
const UPDATE_INTERVAL = 200; // ms between generations
const SAVE_INTERVAL = 10000; // Save every 10 seconds

// Game of Life engine functions
const getNeighbors = (x: number, y: number): string[] => {
  const neighbors: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      neighbors.push(`${x + dx},${y + dy}`);
    }
  }
  return neighbors;
};

const getAliveNeighborCount = (x: number, y: number, cellSet: Set<string>): number => {
  return getNeighbors(x, y).filter(key => cellSet.has(key)).length;
};

const nextGeneration = (currentCells: Set<string>): Set<string> => {
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
};

const initializePatterns = (): Set<string> => {
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
};

const loadStateFromStorage = (): GameOfLifeState | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        cells: new Set(parsed.cells || []),
        generation: parsed.generation || 0,
        isRunning: parsed.isRunning !== false, // Default to true
        viewport: parsed.viewport || { x: 0, y: 0, zoom: 8 }
      };
    }
  } catch (error) {
    console.error('Error loading Game of Life state:', error);
  }
  
  return null;
};

const saveStateToStorage = (state: GameOfLifeState): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const serializable = {
      cells: Array.from(state.cells),
      generation: state.generation,
      isRunning: state.isRunning,
      viewport: state.viewport
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving Game of Life state:', error);
  }
};

export function GameOfLifeProvider({ children }: { children: React.ReactNode }) {
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Initialize state from storage or defaults
  const [state, setState] = useState<GameOfLifeState>(() => {
    const stored = loadStateFromStorage();
    return stored || {
      cells: initializePatterns(),
      generation: 0,
      isRunning: true,
      viewport: { x: 0, y: 0, zoom: 8 }
    };
  });

  // Game loop that runs continuously
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) return; // Already running
    
    gameLoopRef.current = setInterval(() => {
      setState(prevState => {
        if (!prevState.isRunning) return prevState;
        
        const now = Date.now();
        if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
          return prevState;
        }
        lastUpdateRef.current = now;
        
        return {
          ...prevState,
          cells: nextGeneration(prevState.cells),
          generation: prevState.generation + 1
        };
      });
    }, UPDATE_INTERVAL);
  }, []);

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Auto-save mechanism
  const startAutoSave = useCallback(() => {
    if (saveIntervalRef.current) return; // Already running
    
    saveIntervalRef.current = setInterval(() => {
      setState(currentState => {
        saveStateToStorage(currentState);
        return currentState;
      });
    }, SAVE_INTERVAL);
  }, []);

  const stopAutoSave = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  }, []);

  // Actions
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const reset = useCallback(() => {
    setState({
      cells: initializePatterns(),
      generation: 0,
      isRunning: true,
      viewport: { x: 0, y: 0, zoom: 8 }
    });
  }, []);

  const setViewport = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    setState(prev => ({ ...prev, viewport }));
  }, []);

  // Start the game and auto-save when component mounts
  useEffect(() => {
    startGameLoop();
    startAutoSave();
    
    // Save state when the page unloads
    const handleBeforeUnload = () => {
      saveStateToStorage(state);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      stopGameLoop();
      stopAutoSave();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final save on cleanup
      saveStateToStorage(state);
    };
  }, [startGameLoop, startAutoSave, stopGameLoop, stopAutoSave, state]);

  // Save state whenever it changes (with debouncing via the auto-save interval)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveStateToStorage(state);
    }, 1000); // Debounce saves
    
    return () => clearTimeout(timeoutId);
  }, [state]);

  const contextValue: GameOfLifeContextType = {
    state,
    actions: {
      togglePause,
      reset,
      setViewport
    }
  };

  return (
    <GameOfLifeContext.Provider value={contextValue}>
      {children}
    </GameOfLifeContext.Provider>
  );
}

export function useGameOfLife() {
  const context = useContext(GameOfLifeContext);
  if (!context) {
    throw new Error('useGameOfLife must be used within a GameOfLifeProvider');
  }
  return context;
} 