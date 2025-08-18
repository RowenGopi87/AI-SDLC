"use client";

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
  disabled?: boolean;
}

export function ResizeHandle({ 
  direction, 
  onResize, 
  className, 
  disabled = false 
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    setStartPos(direction === 'horizontal' ? e.clientX : e.clientY);
    
    // Add global cursor styles
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    
    onResize(delta);
    setStartPos(currentPos);
  }, [isDragging, direction, onResize, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Reset global cursor styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (disabled) return null;

  return (
    <div
      className={cn(
        "group flex-shrink-0 bg-gray-300 hover:bg-blue-400 transition-all duration-200 relative border-l border-r border-gray-200",
        direction === 'horizontal' 
          ? "w-2 cursor-col-resize hover:w-3" 
          : "h-2 cursor-row-resize hover:h-3",
        isDragging && "bg-blue-500 shadow-md",
        direction === 'horizontal' && isDragging && "w-3",
        direction === 'vertical' && isDragging && "h-3",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator */}
      <div
        className={cn(
          "absolute bg-white rounded-full opacity-60 group-hover:opacity-100 transition-opacity shadow-sm",
          direction === 'horizontal' 
            ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8" 
            : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-8",
          isDragging && "opacity-100 bg-blue-100"
        )}
      />
      
      {/* Dots for better visibility */}
      <div
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2",
          direction === 'horizontal' 
            ? "top-1/2 left-1/2 flex flex-col space-y-1" 
            : "top-1/2 left-1/2 flex space-x-1",
        )}
      >
        <div className="w-0.5 h-0.5 bg-gray-500 rounded-full opacity-50 group-hover:opacity-100"></div>
        <div className="w-0.5 h-0.5 bg-gray-500 rounded-full opacity-50 group-hover:opacity-100"></div>
        <div className="w-0.5 h-0.5 bg-gray-500 rounded-full opacity-50 group-hover:opacity-100"></div>
      </div>
    </div>
  );
}
