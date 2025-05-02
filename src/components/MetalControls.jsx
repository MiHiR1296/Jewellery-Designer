import React, { useState } from 'react';
import * as THREE from 'three';
import { METAL_PRESETS, FINISH_PRESETS } from '../core/materialManager';
import { Palette } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Component for metal type and finish selection
const MetalControls = ({ onMetalChange, onFinishChange, onColorChange }) => {
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [selectedFinish, setSelectedFinish] = useState('polished');
  const [customColor, setCustomColor] = useState('#FFD700'); // Default gold color
  const { theme } = useTheme();
  
  // Handle metal type change
  const handleMetalChange = (e) => {
    const metal = e.target.value;
    setSelectedMetal(metal);
    
    // Update color picker with the metal's default color
    const hexColor = '#' + (new THREE.Color(METAL_PRESETS[metal].color).getHexString());
    setCustomColor(hexColor);
    
    // Notify parent components
    onMetalChange(metal);
    onColorChange(hexColor);
  };
  
  // Handle finish change
  const handleFinishChange = (e) => {
    const finish = e.target.value;
    setSelectedFinish(finish);
    onFinishChange(finish);
  };
  
  // Handle color change
  const handleColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3" 
        style={{ 
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-heading)'
        }}>
        <Palette className="w-4 h-4" />
        Metal Options
      </h3>
      
      {/* Metal Type Selection */}
      <div className="space-y-1">
        <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Metal Type</label>
        <select
          value={selectedMetal}
          onChange={handleMetalChange}
          className="w-full px-3 py-1 rounded-lg text-sm focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-light)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {Object.entries(METAL_PRESETS).map(([id, metal]) => (
            <option key={id} value={id}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Finish Selection */}
      <div className="space-y-1">
        <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Surface Finish</label>
        <select
          value={selectedFinish}
          onChange={handleFinishChange}
          className="w-full px-3 py-1 rounded-lg text-sm focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-light)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {Object.entries(FINISH_PRESETS).map(([id, finish]) => (
            <option key={id} value={id}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
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
              onColorChange(e.target.value);
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
      <div 
        className="h-10 w-full rounded-lg"
        style={{ 
          backgroundColor: customColor,
          boxShadow: 'var(--shadow-small)',
          borderRadius: '0.5rem'
        }}
      />
    </div>
  );
};

export default MetalControls;