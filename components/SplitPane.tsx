import React, { useState, useRef, useEffect } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialSplit?: number; // Percentage for left pane (0-100)
  minLeft?: number; // Minimum width in pixels for left pane
  minRight?: number; // Minimum width in pixels for right pane
}

export default function SplitPane({
  left,
  right,
  initialSplit = 40,
  minLeft = 350,
  minRight = 450,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState<number>(initialSplit);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startLeftWidthRef = useRef<number>(initialSplit);

  const onMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startLeftWidthRef.current = leftWidth;
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Disable text selection during resize
    document.body.style.userSelect = 'none';
  };
  
  const onMouseMove = (e: MouseEvent) => {
    if (!splitPaneRef.current) return;
    
    const containerWidth = splitPaneRef.current.offsetWidth;
    const dx = e.clientX - startXRef.current;
    
    // Calculate percentage change
    const percentageDiff = (dx / containerWidth) * 100;
    const newLeftWidth = Math.min(
      Math.max(
        startLeftWidthRef.current + percentageDiff,
        (minLeft / containerWidth) * 100
      ),
      100 - ((minRight / containerWidth) * 100)
    );
    
    setLeftWidth(newLeftWidth);
  };
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    // Re-enable text selection
    document.body.style.userSelect = '';
  };
  
  // Clean up event listeners on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  
  return (
    <div 
      ref={splitPaneRef} 
      className="flex h-full w-full overflow-hidden"
    >
      <div 
        className="h-full overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>
      
      <div 
        ref={resizerRef}
        className="resizer h-full"
        onMouseDown={onMouseDown}
      />
      
      <div 
        className="h-full overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
} 