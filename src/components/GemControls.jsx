import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import * as THREE from 'three';
import { GEM_PRESETS } from '../core/materialManager';

// Component for gemstone selection and customization
const GemControls = ({ onGemChange, onGemColorChange }) => {
  const [selectedGem, setSelectedGem] = useState('diamond');
  const [customColor, setCustomColor] = useState('#FFFFFF'); // Default diamond color
  
  // Handle gem type change
  const handleGemChange = (e) => {
    const gem = e.target.value;
    setSelectedGem(gem);
    
    // Update color picker with the gem's default color
    const hexColor = '#' + (new THREE.Color(GEM_PRESETS[gem].color).getHexString());
    setCustomColor(hexColor);
    
    // Notify parent components
    onGemChange(gem);
    onGemColorChange(hexColor);
  };
  
  // Handle color change
  const handleColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onGemColorChange(color);
  };
  
  const selectedGemPreset = GEM_PRESETS[selectedGem];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"
        style={{ 
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-heading)'
        }}>
        <Gem className="w-4 h-4" />
        Gemstone Options
      </h3>
      
      {/* Gem Type Selection */}
      <div className="space-y-1">
        <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Gemstone Type</label>
        <select
          value={selectedGem}
          onChange={handleGemChange}
          className="w-full px-3 py-1 rounded-lg text-sm focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-light)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {Object.keys(GEM_PRESETS).map((gem) => (
            <option key={gem} value={gem}>
              {gem.charAt(0).toUpperCase() + gem.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Custom Color */}
      <div className="space-y-1">
        <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Custom Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={customColor}
            onChange={handleColorChange}
            className="h-10 rounded"
            style={{ borderColor: 'var(--border-light)' }}
          />
          <input
            type="text"
            value={customColor}
            onChange={e => {
              setCustomColor(e.target.value);
              onGemColorChange(e.target.value);
            }}
            className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-light)',
              fontFamily: 'var(--font-primary)'
            }}
          />
        </div>
      </div>
      
      {/* Preview Color Display */}
      <div className="h-12 w-full rounded-lg relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: customColor,
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5)'
          }}
        />
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)'
        }} />
        <span className="absolute right-2 top-2 rounded px-2 py-1 text-xs font-semibold" style={{
          backgroundColor: 'rgba(255, 253, 248, 0.78)',
          color: 'var(--text-secondary)'
        }}>
          RI {selectedGemPreset.ior.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default GemControls;
