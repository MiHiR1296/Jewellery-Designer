import React, { useState, useEffect } from 'react';
import { HelpCircle, Move } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ControlsTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeKeys, setActiveKeys] = useState({});
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys(prev => ({ ...prev, [key]: true }));
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getKeyStyle = (key) => {
    const isActive = activeKeys[key];
    
    return {
      backgroundColor: isActive ? 'var(--element-secondary)' : 'var(--bg-tertiary)',
      color: isActive ? (isDarkMode ? 'white' : 'white') : 'var(--text-primary)',
      padding: '2px 6px',
      borderRadius: '4px',
      border: `1px solid ${isActive ? 'var(--element-secondary)' : 'var(--border-light)'}`,
      display: 'inline-block',
      minWidth: '24px',
      textAlign: 'center',
      marginRight: '8px',
      fontFamily: 'monospace',
      boxShadow: isActive ? 'var(--shadow-accent-glow)' : 'none'
    };
  };

  return (
    <div className="absolute left-4 top-4 z-20">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isVisible 
            ? 'var(--element-secondary)' 
            : 'var(--bg-secondary)',
          color: isVisible 
            ? (isDarkMode ? 'white' : 'white') 
            : 'var(--text-secondary)',
          border: `1px solid ${isVisible 
            ? 'var(--element-secondary)' 
            : 'var(--border-light)'}`,
          boxShadow: isVisible ? 'var(--shadow-accent-glow)' : 'var(--shadow-small)'
        }}
        title={isVisible ? "Hide Controls" : "Show Controls"}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute left-0 top-12 rounded-lg p-4 text-sm shadow-lg border min-w-[250px]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-light)',
            boxShadow: 'var(--shadow-large)'
          }}>
          <h3 className="font-semibold mb-3 flex items-center gap-2" 
            style={{ 
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)'
            }}>
            <Move className="w-4 h-4" /> Camera Controls
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Move Forward</span>
              <div>
                <span style={getKeyStyle('w')}>W</span>
                <span style={getKeyStyle('arrowup')}>↑</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Move Backward</span>
              <div>
                <span style={getKeyStyle('s')}>S</span>
                <span style={getKeyStyle('arrowdown')}>↓</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Rotate Left</span>
              <div>
                <span style={getKeyStyle('a')}>A</span>
                <span style={getKeyStyle('arrowleft')}>←</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Rotate Right</span>
              <div>
                <span style={getKeyStyle('d')}>D</span>
                <span style={getKeyStyle('arrowright')}>→</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Move Up</span>
              <span style={getKeyStyle('q')}>Q</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Move Down</span>
              <span style={getKeyStyle('e')}>E</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Reset Camera</span>
              <span style={getKeyStyle('f')}>F</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>Toggle Auto-Rotation</span>
              <span style={getKeyStyle('r')}>R</span>
            </div>
          </div>
          <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            You can also use the mouse:
            <ul className="mt-1 space-y-1 ml-2">
              <li>• Left-click + drag to rotate</li>
              <li>• Right-click + drag to pan</li>
              <li>• Scroll to zoom</li>
              <li>• Middle-click + drag to adjust zoom</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlsTooltip;