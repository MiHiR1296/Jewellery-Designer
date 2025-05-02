import React, { useState, useEffect } from 'react';
import { JEWELRY_MODELS } from '../core/modelLoader';
import { useTheme } from './ThemeProvider';

// Group models by type for better organization
const getModelsByCategory = () => {
  const categories = {};
  
  Object.entries(JEWELRY_MODELS).forEach(([id, model]) => {
    const category = model.type || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      id,
      ...model
    });
  });
  
  return categories;
};

const ModelSelector = ({ onModelChange, selectedModel }) => {
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  
  // Initialize categories on component mount
  useEffect(() => {
    setCategories(getModelsByCategory());
  }, []);
  
  // Handle model selection
  const handleModelChange = async (e) => {
    const modelId = e.target.value;
    setIsLoading(true);
    
    try {
      await onModelChange(modelId);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 style={{ 
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-secondary)'
      }} className="text-lg font-semibold mb-3">
        Select Jewelry
      </h3>
      
      <select
        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)', 
          borderColor: 'var(--border-light)',
          fontFamily: 'var(--font-primary)'
        }}
        value={selectedModel}
        onChange={handleModelChange}
        disabled={isLoading}
      >
        {Object.entries(categories).map(([category, models]) => (
          <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 animate-pulse">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--element-primary)' }}></div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--element-primary)' }}></div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--element-primary)' }}></div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading model...</span>
        </div>
      )}
      
      {/* Preview of selected model */}
      {selectedModel && JEWELRY_MODELS[selectedModel] && (
        <div className="mt-2 p-3 rounded-lg" style={{ 
          backgroundColor: 'var(--bg-highlight)', 
          borderLeft: '3px solid var(--element-secondary)'
        }}>
          <h4 className="text-sm font-medium" style={{ fontFamily: 'var(--font-primary)' }}>
            {JEWELRY_MODELS[selectedModel].name}
          </h4>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div>Type: {JEWELRY_MODELS[selectedModel].type}</div>
            <div>Parts: {JEWELRY_MODELS[selectedModel].parts.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;