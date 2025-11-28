import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizablePanelProps {
  children: [React.ReactNode, React.ReactNode];
  defaultLeftWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultLeftWidth = 50,
  minWidth = 20,
  maxWidth = 80,
  className = ''
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.classList.add('dragging');
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
  }, []);

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

  return (
    <div ref={containerRef} className={`flex h-full relative ${className}`}>
      {/* Left Panel */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        className={`resizer ${isDragging ? 'dragging' : ''} w-1 hover:w-2 transition-all duration-150 cursor-col-resize relative group`}
        onMouseDown={handleMouseDown}
      >
        {/* Hover area expansion */}
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Right Panel */}
      <div
        className="flex flex-col overflow-hidden flex-1"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {children[1]}
      </div>
    </div>
  );
};