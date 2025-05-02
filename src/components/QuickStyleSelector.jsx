import React, { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Predefined style configurations for the Eclipse Ruby Ring
const ECLIPSE_RING_PRESETS = [
  {
    id: 'classic-gold-ruby',
    name: 'Classic Gold & Ruby',
    materials: {
      Ring: 'gold',
      Ruby_Base: 'gold',
      Ruby: 'ruby'
    },
    finish: 'polished'
  },
  {
    id: 'silver-ruby',
    name: 'Silver & Ruby',
    materials: {
      Ring: 'silver',
      Ruby_Base: 'silver',
      Ruby: 'ruby'
    },
    finish: 'polished'
  },
  {
    id: 'rose-gold-ruby',
    name: 'Rose Gold & Ruby',
    materials: {
      Ring: 'rose-gold',
      Ruby_Base: 'rose-gold',
      Ruby: 'ruby'
    },
    finish: 'polished'
  },
  {
    id: 'platinum-ruby',
    name: 'Platinum & Ruby',
    materials: {
      Ring: 'platinum',
      Ruby_Base: 'platinum',
      Ruby: 'ruby'
    },
    finish: 'polished'
  },
  {
    id: 'gold-diamond',
    name: 'Gold & Diamond',
    materials: {
      Ring: 'gold',
      Ruby_Base: 'gold',
      Ruby: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'gold-sapphire',
    name: 'Gold & Sapphire',
    materials: {
      Ring: 'gold',
      Ruby_Base: 'gold',
      Ruby: 'sapphire'
    },
    finish: 'polished'
  },
  {
    id: 'gold-emerald',
    name: 'Gold & Emerald',
    materials: {
      Ring: 'gold',
      Ruby_Base: 'gold',
      Ruby: 'emerald'
    },
    finish: 'polished'
  },
  {
    id: 'vintage-bronze',
    name: 'Vintage Bronze & Ruby',
    materials: {
      Ring: 'bronze',
      Ruby_Base: 'bronze',
      Ruby: 'ruby'
    },
    finish: 'brushed'
  }
];

const QuickStyleSelector = ({ onStyleChange, appRef }) => {
  const [selectedStyle, setSelectedStyle] = useState('classic-gold-ruby');
  const { isDarkMode, theme } = useTheme();

  const handleStyleChange = (styleId) => {
    setSelectedStyle(styleId);
    
    // Find the selected style configuration
    const style = ECLIPSE_RING_PRESETS.find(preset => preset.id === styleId);
    if (!style || !appRef.current) return;

    // Apply the style to the model
    applyStyle(style);
    
    // Notify parent component
    if (onStyleChange) {
      onStyleChange(style);
    }
  };

  // Function to apply a style to the model
  const applyStyle = (style) => {
    if (!appRef.current) return;
    
    try {
      // First apply the finish to ensure all metal parts have the right finish
      if (style.finish) {
        appRef.current.updateFinish(style.finish);
      }
      
      // For each material in the style
      Object.entries(style.materials).forEach(([partName, materialType]) => {
        // Select the part
        const partObject = selectPartByName(partName);
        
        if (partObject) {
          // Set the global selected object
          window.selectedObject = partObject;
          
          // Apply the material
          if (appRef.current.updateMaterial) {
            appRef.current.updateMaterial(materialType);
          } else {
            console.warn('updateMaterial method not found on appRef.current');
          }
        }
      });
    } catch (error) {
      console.error('Error applying style:', error);
    }
  };

  // Helper function to find and select a part by name
  const selectPartByName = (partName) => {
    if (!window.scene) {
      console.warn('Scene not available');
      return null;
    }
    
    let targetObject = null;
    
    // Find the mesh with the matching part name
    window.scene.traverse((object) => {
      if (object.isMesh && 
          (object.name === partName || object.userData.partName === partName)) {
        targetObject = object;
      }
    });
    
    if (!targetObject) {
      console.warn(`Part not found: ${partName}`);
    }
    
    return targetObject;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"
        style={{ 
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-heading)'
        }}>
        <Sparkles className="w-4 h-4" />
        Quick Styles
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {ECLIPSE_RING_PRESETS.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            className="p-3 rounded-lg text-sm transition-all duration-200"
            style={{
              backgroundColor: selectedStyle === style.id 
                ? 'var(--element-secondary)' 
                : 'var(--bg-tertiary)',
              color: selectedStyle === style.id 
                ? isDarkMode ? 'white' : 'white' 
                : 'var(--text-primary)',
              border: `1px solid ${selectedStyle === style.id 
                ? 'var(--element-secondary)' 
                : 'var(--border-light)'}`,
              boxShadow: selectedStyle === style.id 
                ? 'var(--shadow-accent-glow)' 
                : 'none',
              fontFamily: 'var(--font-primary)'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium">{style.name}</span>
              <div className="flex items-center gap-1">
                {style.id.includes('gold') && (
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                )}
                {style.id.includes('silver') && (
                  <span className="h-3 w-3 rounded-full bg-gray-300" />
                )}
                {style.id.includes('rose-gold') && (
                  <span className="h-3 w-3 rounded-full bg-orange-300" />
                )}
                {style.id.includes('platinum') && (
                  <span className="h-3 w-3 rounded-full bg-gray-400" />
                )}
                {style.id.includes('bronze') && (
                  <span className="h-3 w-3 rounded-full bg-amber-700" />
                )}
                {style.id.includes('ruby') && (
                  <span className="h-3 w-3 rounded-full bg-red-600" />
                )}
                {style.id.includes('diamond') && (
                  <span className="h-3 w-3 rounded-full bg-blue-100" />
                )}
                {style.id.includes('sapphire') && (
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                )}
                {style.id.includes('emerald') && (
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-2 rounded-lg" style={{ 
        backgroundColor: 'var(--bg-highlight)', 
        border: '1px solid var(--border-light)' 
      }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Quick styles apply predefined materials and finishes to your Eclipse Ruby Ring.
          You can still customize individual parts after applying a style.
        </p>
      </div>
    </div>
  );
};

export default QuickStyleSelector;