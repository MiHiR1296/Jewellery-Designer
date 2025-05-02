import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

const ResizableSidebar = ({ children, isOpen }) => {
  const [width, setWidth] = useState(320); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const { theme } = useTheme();

  // Persist width in localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      setWidth(parseInt(savedWidth, 10));
    }
  }, []);

  // Save width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarWidth', width.toString());
  }, [width]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    // Prevent text selection during resize
    e.preventDefault();
    
    // Calculate new width, constrain between min and max
    const newWidth = Math.max(
      300,  // Minimum width
      Math.min(
        window.innerWidth * 0.7,  // Maximum width (70% of window)
        window.innerWidth - e.clientX
      )
    );
    
    setWidth(newWidth);
  }, [isResizing]);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={sidebarRef}
      className="sidebar fixed right-0 top-14 bottom-0 transform transition-transform duration-300 ease-in-out z-10 overflow-y-auto overflow-x-hidden"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-light)',
        width: isOpen ? Math.max(width, 300) : 0,
        maxWidth: '70%',
        minWidth: '300px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        boxShadow: isOpen ? 'var(--shadow-medium)' : 'none'
      }}
    >
      {/* Resizer */}
      <div 
        ref={resizerRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className="absolute left-0 top-0 bottom-0 cursor-col-resize z-50 hover:bg-opacity-30 transition-colors"
        style={{ 
          left: '-8px',
          width: '16px',
          backgroundColor: isResizing ? 'var(--element-secondary)' : 'transparent',
          opacity: isResizing ? 0.2 : 0
        }}
      />
      
      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {children}
      </div>
    </div>
  );
};

export default ResizableSidebar;