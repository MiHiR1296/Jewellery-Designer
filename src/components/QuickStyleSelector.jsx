import React, { useState, useEffect } from 'react';
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

// Predefined style configurations for the Diamond Ring
const DIAMOND_RING_PRESETS = [
  {
    id: 'classic-gold-diamond',
    name: 'Classic Gold & Diamond',
    materials: {
      Ring: 'gold',
      Setting: 'gold',
      Band: 'gold',
      Diamond: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'silver-diamond',
    name: 'Silver & Diamond',
    materials: {
      Ring: 'silver',
      Setting: 'silver',
      Band: 'silver',
      Diamond: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'rose-gold-diamond',
    name: 'Rose Gold & Diamond',
    materials: {
      Ring: 'rose-gold',
      Setting: 'rose-gold',
      Band: 'rose-gold',
      Diamond: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'platinum-diamond',
    name: 'Platinum & Diamond',
    materials: {
      Ring: 'platinum',
      Setting: 'platinum',
      Band: 'platinum',
      Diamond: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'bronze-diamond',
    name: 'Bronze & Diamond',
    materials: {
      Ring: 'bronze',
      Setting: 'bronze',
      Band: 'bronze',
      Diamond: 'diamond'
    },
    finish: 'brushed'
  },
  {
    id: 'copper-diamond',
    name: 'Copper & Diamond',
    materials: {
      Ring: 'copper',
      Setting: 'copper',
      Band: 'copper',
      Diamond: 'diamond'
    },
    finish: 'satin'
  },
  {
    id: 'gold-diamond-polished',
    name: 'Gold & Diamond (Polished)',
    materials: {
      Ring: 'gold',
      Setting: 'gold',
      Band: 'gold',
      Diamond: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'platinum-diamond-satin',
    name: 'Platinum & Diamond (Satin)',
    materials: {
      Ring: 'platinum',
      Setting: 'platinum',
      Band: 'platinum',
      Diamond: 'diamond'
    },
    finish: 'satin'
  }
];

// Predefined style configurations for the Diamond Earrings
const DIAMOND_EARRINGS_PRESETS = [
  {
    id: 'classic-gold-diamond-earrings',
    name: 'Classic Gold & Diamond',
    materials: {
      Earrings: 'gold',
      Diamonds: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'silver-diamond-earrings',
    name: 'Silver & Diamond',
    materials: {
      Earrings: 'silver',
      Diamonds: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'rose-gold-diamond-earrings',
    name: 'Rose Gold & Diamond',
    materials: {
      Earrings: 'rose-gold',
      Diamonds: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'platinum-diamond-earrings',
    name: 'Platinum & Diamond',
    materials: {
      Earrings: 'platinum',
      Diamonds: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'bronze-diamond-earrings',
    name: 'Bronze & Diamond',
    materials: {
      Earrings: 'bronze',
      Diamonds: 'diamond'
    },
    finish: 'brushed'
  },
  {
    id: 'copper-diamond-earrings',
    name: 'Copper & Diamond',
    materials: {
      Earrings: 'copper',
      Diamonds: 'diamond'
    },
    finish: 'satin'
  },
  {
    id: 'gold-diamond-earrings-polished',
    name: 'Gold & Diamond (Polished)',
    materials: {
      Earrings: 'gold',
      Diamonds: 'diamond'
    },
    finish: 'polished'
  },
  {
    id: 'platinum-diamond-earrings-satin',
    name: 'Platinum & Diamond (Satin)',
    materials: {
      Earrings: 'platinum',
      Diamonds: 'diamond'
    },
    finish: 'satin'
  }
];

const QuickStyleSelector = ({ onStyleChange, appRef, selectedModel }) => {
  // Get the appropriate presets based on the selected model
  const getPresets = () => {
    if (selectedModel === 'diamond_ring') {
      return DIAMOND_RING_PRESETS;
    }
    if (selectedModel === 'diamond_earrings') {
      return DIAMOND_EARRINGS_PRESETS;
    }
    return ECLIPSE_RING_PRESETS;
  };

  const presets = getPresets();
  const [selectedStyle, setSelectedStyle] = useState(presets[0]?.id || '');
  const { isDarkMode, theme } = useTheme();

  // Reset selected style when model changes
  useEffect(() => {
    const currentPresets = getPresets();
    if (currentPresets.length > 0) {
      setSelectedStyle(currentPresets[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  const handleStyleChange = (styleId) => {
    setSelectedStyle(styleId);
    
    // Find the selected style configuration
    const style = presets.find(preset => preset.id === styleId);
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
    if (!appRef.current || !appRef.current.materialManager) return;
    
    try {
      const materialManager = appRef.current.materialManager;
      
      // First apply the finish to ensure all metal parts have the right finish
      if (style.finish) {
        appRef.current.updateFinish(style.finish);
      }
      
      // For each material in the style, apply directly to matching parts
      Object.entries(style.materials).forEach(([partName, materialType]) => {
        // Find all objects with this part name
        const partObjects = findAllPartsByName(partName);
        
        if (partObjects.length > 0) {
          console.log(`Applying ${materialType} to ${partObjects.length} part(s) named "${partName}"`);
          
          // Determine if it's a metal or gem material
          const isMetal = materialManager.METAL_PRESETS && materialType in materialManager.METAL_PRESETS;
          const isGem = materialManager.GEM_PRESETS && materialType in materialManager.GEM_PRESETS;
          
          if (isMetal) {
            // Apply metal material with current finish
            const finish = style.finish || 'polished';
            const material = materialManager.createMetalMaterial(materialType, finish);
            
            partObjects.forEach(object => {
              if (object.material) {
                object.material.dispose();
              }
              object.material = material.clone();
              object.material.needsUpdate = true;
            });
          } else if (isGem) {
            // Apply gem material
            const material = materialManager.createGemMaterial(materialType);
            
            partObjects.forEach(object => {
              if (object.material) {
                object.material.dispose();
              }
              object.material = material.clone();
              object.material.needsUpdate = true;
            });
          } else {
            console.warn(`Unknown material type: ${materialType}`);
          }
        } else {
          console.warn(`No parts found for: ${partName}. Available parts:`, getAllPartNames());
        }
      });
    } catch (error) {
      console.error('Error applying style:', error);
    }
  };

  // Helper function to find all parts by name (case-insensitive)
  const findAllPartsByName = (partName) => {
    if (!window.scene) {
      console.warn('Scene not available');
      return [];
    }
    
    const foundObjects = [];
    const partNameLower = partName.toLowerCase();
    
    // Find all meshes with matching part name
    window.scene.traverse((object) => {
      if (object.isMesh) {
        const objectName = object.name ? object.name.toLowerCase() : '';
        const userDataPartName = object.userData?.partName ? object.userData.partName.toLowerCase() : '';
        
        // Check for exact match or contains match
        if (objectName === partNameLower || 
            userDataPartName === partNameLower ||
            objectName.includes(partNameLower) ||
            userDataPartName.includes(partNameLower)) {
          foundObjects.push(object);
        }
      }
    });
    
    return foundObjects;
  };

  // Helper function to get all part names for debugging
  const getAllPartNames = () => {
    if (!window.scene) return [];
    
    const partNames = new Set();
    window.scene.traverse((object) => {
      if (object.isMesh) {
        if (object.name) partNames.add(object.name);
        if (object.userData?.partName) partNames.add(object.userData.partName);
      }
    });
    
    return Array.from(partNames);
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
        {presets.map((style) => (
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
                  <span className="h-3 w-3 rounded-full bg-blue-100 border border-gray-300" />
                )}
                {style.id.includes('copper') && (
                  <span className="h-3 w-3 rounded-full bg-orange-600" />
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
          Quick styles apply predefined materials and finishes to your {
            selectedModel === 'diamond_ring' ? 'Diamond Ring' :
            selectedModel === 'diamond_earrings' ? 'Diamond Earrings' :
            'Eclipse Ruby Ring'
          }.
          You can still customize individual parts after applying a style.
        </p>
      </div>
    </div>
  );
};

export default QuickStyleSelector;