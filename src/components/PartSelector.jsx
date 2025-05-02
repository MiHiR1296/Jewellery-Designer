import React, { useState, useEffect } from 'react';
import { ScanSearch } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const PartSelector = ({ onPartSelect, selectedPart }) => {
  const [availableParts, setAvailableParts] = useState([]);
  const { isDarkMode, theme } = useTheme();
  
  // Find available parts in the scene
  useEffect(() => {
    const findParts = () => {
      const scene = window.scene;
      if (!scene) return;
      
      const parts = [];
      
      // Traverse scene to find mesh objects that are part of the jewelry
      scene.traverse(object => {
        if (object.isMesh && object.userData.isImported) {
          const partName = object.userData.partName || object.name;
          const partType = object.userData.partType || 'unknown';
          
          // Only add each part once
          if (!parts.some(p => p.id === object.uuid)) {
            parts.push({
              id: object.uuid,
              name: formatPartName(partName),
              originalName: partName,
              type: partType,
              object: object
            });
          }
        }
      });
      
      setAvailableParts(parts);
    };
    
    // Find parts on mount and when model changes
    findParts();
    
    // Listen for model load events
    const handleModelLoaded = () => {
      setTimeout(findParts, 500); // Wait for model to fully initialize
    };
    
    window.addEventListener('model-loaded', handleModelLoaded);
    
    return () => {
      window.removeEventListener('model-loaded', handleModelLoaded);
    };
  }, []);
  
  // Helper function to format part names for display
  const formatPartName = (name) => {
    // Handle empty names
    if (!name) return 'Unknown Part';
    
    // Remove numbers and special characters
    let formatted = name.replace(/[0-9_\.]/g, ' ');
    
    // Add spaces between camel case words
    formatted = formatted.replace(/([A-Z])/g, ' $1');
    
    // Clean up excess whitespace
    formatted = formatted.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter of each word
    return formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Handle part selection
  const handlePartSelect = (part) => {
    // Set the global selectedObject for model-wide access
    window.selectedObject = part.object;
    
    // Invoke callback with selected part
    onPartSelect(part);
  };

  // Get theme-specific styles for part type badges
  const getTypeBadgeStyle = (partType) => {
    if (partType === 'gem') {
      return {
        backgroundColor: isDarkMode 
          ? 'rgba(163, 39, 61, 0.2)' 
          : 'rgba(75, 0, 130, 0.1)',
        color: isDarkMode ? '#F0A3B3' : '#4B0082'
      };
    } else {
      return {
        backgroundColor: isDarkMode 
          ? 'rgba(212, 175, 55, 0.2)' 
          : 'rgba(229, 228, 226, 0.3)',
        color: isDarkMode ? '#D4AF37' : '#333333'
      };
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"
        style={{ 
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-heading)'
        }}>
        <ScanSearch className="w-4 h-4" />
        Select Part
      </h3>
      
      {availableParts.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
          No parts available. Please load a model first.
        </p>
      ) : (
        <div className="space-y-2">
          {availableParts.map(part => (
            <button
              key={part.id}
              onClick={() => handlePartSelect(part)}
              className="w-full p-2 text-left rounded-lg transition-all duration-200"
              style={{
                backgroundColor: selectedPart?.id === part.id 
                  ? 'var(--bg-highlight)' 
                  : 'var(--bg-tertiary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedPart?.id === part.id 
                  ? 'var(--element-secondary)' 
                  : 'var(--border-light)',
                fontFamily: 'var(--font-primary)',
                color: 'var(--text-primary)',
                boxShadow: selectedPart?.id === part.id 
                  ? 'var(--shadow-accent-glow)' 
                  : 'none'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{part.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" 
                  style={getTypeBadgeStyle(part.type)}>
                  {part.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Selection Info */}
      {selectedPart && (
        <div className="p-2 rounded-lg text-xs" style={{ 
          backgroundColor: 'var(--bg-highlight)',
          borderLeft: '3px solid var(--element-secondary)',
          color: 'var(--text-muted)' 
        }}>
          <p>Selected: <span style={{ color: 'var(--text-primary)' }}>{selectedPart.name}</span></p>
          <p>Type: <span style={{ color: 'var(--text-primary)' }}>{selectedPart.type}</span></p>
          {selectedPart.object?.material && (
            <p className="mt-1">
              Material Properties: 
              {selectedPart.object.material.metalness > 0.5 ? 
                <span style={{ color: isDarkMode ? '#D4AF37' : '#4B0082' }} className="ml-1">Metallic</span> : 
                <span style={{ color: isDarkMode ? '#A3273D' : '#9370DB' }} className="ml-1">Non-Metallic</span>
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PartSelector;