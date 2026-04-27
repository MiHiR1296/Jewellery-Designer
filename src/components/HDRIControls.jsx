import React, { useState } from 'react';
import { RotateCw, Sun, Eye, EyeOff } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const HDRIControls = ({ 
    onRotationChange, 
    onIntensityChange,
    onBackgroundToggle 
}) => {
    const [rotation, setRotation] = useState(0);
    const [intensity, setIntensity] = useState(0.7);
    const [showAsBackground, setShowAsBackground] = useState(false);
    const { isDarkMode } = useTheme();

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
                    title={showAsBackground ? "Use soft backdrop" : "Use staged backdrop"}
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
        </div>
    );
};

export default HDRIControls;
