import React, { useState } from 'react';
import { RotateCw, Sun, Eye, EyeOff } from 'lucide-react';
import { HDRI_OPTIONS } from '../core/lighting';
import { useTheme } from './ThemeProvider';

const HDRIControls = ({ 
    onHDRIChange, 
    onRotationChange, 
    onIntensityChange,
    onBackgroundToggle 
}) => {
    const [rotation, setRotation] = useState(0);
    const [selectedHDRI, setSelectedHDRI] = useState('jewelry_studio');
    const [intensity, setIntensity] = useState(1.0);
    const [showAsBackground, setShowAsBackground] = useState(false);
    const { isDarkMode, theme } = useTheme();

    const handleHDRIChange = (e) => {
        const hdriId = e.target.value;
        const defaultIntensity = HDRI_OPTIONS[hdriId]?.defaultIntensity || 1.0;
        setSelectedHDRI(hdriId);
        setIntensity(defaultIntensity);
        
        console.log(`Loading HDRI: ${hdriId} with intensity: ${defaultIntensity}`);
        onHDRIChange(HDRI_OPTIONS[hdriId]?.path, defaultIntensity);
    };

    const handleRotationChange = (e) => {
        const newRotation = parseFloat(e.target.value);
        setRotation(newRotation);
        onRotationChange(newRotation);
    };

    const handleIntensityChange = (e) => {
        const newIntensity = parseFloat(e.target.value);
        setIntensity(newIntensity);
        onIntensityChange(newIntensity);
    };

    const toggleBackground = () => {
        const newValue = !showAsBackground;
        setShowAsBackground(newValue);
        onBackgroundToggle(newValue);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center justify-between mb-3"
                style={{ 
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-heading)'
                }}>
                <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" /> 
                    Lighting Setup
                </div>
                <button
                    onClick={toggleBackground}
                    title={showAsBackground ? "Hide HDRI Background" : "Show HDRI Background"}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: showAsBackground 
                            ? 'var(--element-secondary)' 
                            : 'var(--bg-tertiary)',
                        color: showAsBackground 
                            ? isDarkMode ? 'white' : 'white' 
                            : 'var(--text-secondary)',
                        border: `1px solid ${showAsBackground 
                            ? 'var(--element-secondary)' 
                            : 'var(--border-light)'}`,
                        boxShadow: showAsBackground 
                            ? 'var(--shadow-accent-glow)' 
                            : 'none'
                    }}
                >
                    {showAsBackground ? (
                        <Eye className="w-4 h-4" />
                    ) : (
                        <EyeOff className="w-4 h-4" />
                    )}
                </button>
            </h3>
            
            {/* HDRI Selection */}
            <div className="space-y-1">
                <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Environment</label>
                <select
                    value={selectedHDRI}
                    onChange={handleHDRIChange}
                    className="w-full px-3 py-1 rounded-lg text-sm focus:outline-none"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-primary)'
                    }}
                >
                    {Object.entries(HDRI_OPTIONS).map(([id, hdri]) => (
                        <option key={id} value={id}>{hdri.name}</option>
                    ))}
                </select>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {HDRI_OPTIONS[selectedHDRI]?.description || "Select an environment lighting preset"}
                </p>
            </div>

            {/* Rotation Control */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <RotateCw className="w-4 h-4" /> Rotation
                    </label>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rotation.toFixed(0)}°</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={handleRotationChange}
                    className="w-full"
                    style={{ accentColor: 'var(--element-slider)' }}
                />
            </div>

            {/* Intensity Control */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Light Intensity</label>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{intensity.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={intensity}
                    onChange={handleIntensityChange}
                    className="w-full"
                    style={{ accentColor: 'var(--element-slider)' }}
                />
            </div>
            
            {/* Light Preview */}
            <div className="mt-2 p-2 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-highlight)', 
                borderLeft: '3px solid var(--element-secondary)'
            }}>
                <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>Current Light:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{HDRI_OPTIONS[selectedHDRI]?.name}</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ 
                    background: 'var(--gradient-secondary)', 
                    opacity: intensity
                }}></div>
            </div>
        </div>
    );
};

export default HDRIControls;