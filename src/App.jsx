import React, { useRef, useEffect, useState } from 'react';
import { Menu, RefreshCw, RotateCw } from 'lucide-react';
import ThreeApplication from './core/ThreeApplication';
import ControlsTooltip from './components/ControlsTooltip';
import HDRIControls from './components/HDRIControls';
import ResizableSidebar from './components/ResizableSidebar';
import ModelSelector from './components/ModelSelector';
import PartSelector from './components/PartSelector';
import MetalControls from './components/MetalControls';
import GemControls from './components/GemControls';
import QuickStyleSelector from './components/QuickStyleSelector';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { JEWELRY_MODELS } from './core/modelLoader';
import './components/theme.css';

// Main App component wrapped with ThemeProvider
export default function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

// Camera Controls Component
const CameraControls = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="absolute left-4 top-28 z-20 flex flex-col gap-2">
      <button 
        onClick={() => {
          // Manually trigger the resetCamera function
          if (window.scene && window.scene.userData.sceneManager) {
            const loadedModel = window.scene.children.find(child => child.userData?.isLoadedModel);
            if (loadedModel) {
              window.scene.userData.sceneManager.updateCameraForModel(loadedModel);
              console.log("Camera reset via button");
            }
          }
        }}
        className="p-2 rounded-lg transition-colors relative group"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)'
        }}
        title="Reset Camera (F key)"
      >
        <RefreshCw className="w-5 h-5" />
        <div className="absolute left-full ml-2 px-2 py-1 rounded bg-black bg-opacity-80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Reset Camera (F)
        </div>
      </button>
      
      <button 
        onClick={() => {
          // Toggle auto-rotation
          if (window.scene && window.scene.userData.controls) {
            const controls = window.scene.userData.controls;
            controls.autoRotate = !controls.autoRotate;
            controls.autoRotateSpeed = 2.0;
            console.log("Auto-rotation toggled:", controls.autoRotate);
          }
        }}
        className="p-2 rounded-lg transition-colors relative group"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)'
        }}
        title="Toggle Rotation (R key)"
      >
        <RotateCw className="w-5 h-5" />
        <div className="absolute left-full ml-2 px-2 py-1 rounded bg-black bg-opacity-80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Toggle Rotation (R)
        </div>
      </button>
    </div>
  );
};

// The core App component that uses the theme
function App() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('eclipse_ruby_ring');
  const [selectedPart, setSelectedPart] = useState(null);
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    // Cleanup function to ensure we don't create multiple instances
    let isActive = true;

    const initializeApp = async () => {
      try {
        setIsLoading(true);
        const app = new ThreeApplication(canvasRef.current);
        
        // Only set the ref if the component is still mounted
        if (isActive) {
          appRef.current = app;
          await app.initPromise;
        }
      } catch (error) {
        console.error('Failed to initialize application:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      isActive = false;
      if (appRef.current) {
        console.log("Cleaning up ThreeApplication instance");
        appRef.current.dispose();
        appRef.current = null;
      }
    };
  }, []);

  const handleModelChange = async (modelId) => {
    setIsLoading(true);
    try {
      setSelectedModel(modelId);
      await appRef.current.loadModel(modelId);
      // Reset selected part when changing models
      setSelectedPart(null);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartSelect = (part) => {
    setSelectedPart(part);
  };

  const handleMetalChange = (metalType) => {
    if (appRef.current?.materialManager) {
      appRef.current.updateMaterial(metalType);
    }
  };

  const handleFinishChange = (finish) => {
    if (appRef.current?.materialManager) {
      appRef.current.updateFinish(finish);
    }
  };

  const handleColorChange = (hexColor) => {
    if (appRef.current?.materialManager) {
      appRef.current.updateColor(hexColor);
    }
  };

  const handleGemChange = (gemType) => {
    if (appRef.current?.materialManager) {
      appRef.current.updateMaterial(gemType);
    }
  };

  const handleGemColorChange = (hexColor) => {
    if (appRef.current?.materialManager) {
      appRef.current.updateColor(hexColor);
    }
  };

  const handleHDRIChange = (path, intensity) => {
    if (appRef.current?.lightingSystem) {
      appRef.current.lightingSystem.loadHDRI(path, intensity);
    }
  };

  const handleHDRIRotation = (angle) => {
    if (appRef.current?.lightingSystem) {
      appRef.current.lightingSystem.rotateEnvironment(angle);
    }
  };

  const handleHDRIIntensity = (intensity) => {
    if (appRef.current?.lightingSystem) {
      appRef.current.lightingSystem.updateEnvironmentMapIntensity(intensity);
    }
  };

  const handleStyleChange = (style) => {
    console.log('Applied style:', style.name);
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 border-b z-20" 
        style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ 
            color: 'var(--text-secondary)', 
            fontFamily: 'var(--font-heading)'
          }}>
            Jewellry
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(75, 0, 130, 0.08)',
                color: isDarkMode ? '#D4AF37' : '#4B0082',
                border: `1px solid ${isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(75, 0, 130, 0.2)'}`,
              }}
              disabled={isLoading}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex h-screen pt-14">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full" />
          <ControlsTooltip />
          <CameraControls />
        </div>

        {/* Resizable Sidebar */}
        <ResizableSidebar isOpen={isSidebarOpen}>
          {/* Model Selection */}
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          
          {/* Quick Style Selector for Eclipse Ruby Ring */}
          {selectedModel === 'eclipse_ruby_ring' && (
            <QuickStyleSelector 
              onStyleChange={handleStyleChange}
              appRef={appRef}
            />
          )}
          
          {/* Part Selection */}
          <PartSelector 
            selectedPart={selectedPart}
            onPartSelect={handlePartSelect}
          />
          
          {/* Material Controls - Show Metal or Gem controls based on selected part type */}
          {selectedPart && (
            selectedPart.type === 'gem' ? (
              <GemControls 
                onGemChange={handleGemChange}
                onGemColorChange={handleGemColorChange}
              />
            ) : (
              <MetalControls 
                onMetalChange={handleMetalChange}
                onFinishChange={handleFinishChange}
                onColorChange={handleColorChange}
              />
            )
          )}
          
          {/* HDRI Controls */}
          <div className="mb-6 pt-6 section-divider">
            <HDRIControls
              onHDRIChange={handleHDRIChange}
              onRotationChange={handleHDRIRotation}
              onIntensityChange={handleHDRIIntensity}
              onBackgroundToggle={(show) => {
                if (appRef.current?.lightingSystem) {
                  appRef.current.lightingSystem.toggleBackground(show);
                }
              }}
            />
          </div>
        </ResizableSidebar>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-medium)'
          }} className="p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
              style={{ borderColor: 'var(--element-primary)' }}></div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading model...</p>
          </div>
        </div>
      )}
    </div>
  );
}