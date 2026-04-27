import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Aperture,
  Camera,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDot,
  Gem,
  Maximize2,
  Minimize2,
  Pause,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import ThreeApplication from './core/ThreeApplication';
import HDRIControls from './components/HDRIControls';
import PartSelector from './components/PartSelector';
import MetalControls from './components/MetalControls';
import GemControls from './components/GemControls';
import QuickStyleSelector from './components/QuickStyleSelector';
import { ThemeProvider } from './components/ThemeProvider';
import { JEWELRY_MODELS } from './core/modelLoader';
import {
  JEWELLERY_CATEGORIES,
  getCategoryForModel,
  getFirstModelForCategory,
  getStylePresetsForModel,
} from './config/jewelleryUi';
import { applyJewelleryStyle } from './utils/jewelleryStyles';
import './components/theme.css';

const DEFAULT_MODEL = 'eclipse_ruby_ring';

export default function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function getLoadedModel() {
  if (!window.scene) return null;

  const loadedModels = [];
  window.scene.traverse((object) => {
    if (object.userData?.isLoadedModel) loadedModels.push(object);
  });

  return loadedModels[loadedModels.length - 1] || null;
}

function PanelHeader({ title, icon: Icon, onCollapse, side }) {
  const CollapseIcon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      className="jewellery-panel-heading"
      onClick={onCollapse}
      aria-label={`Hide ${title} panel`}
    >
      <span className="jewellery-panel-title">
        <Icon className="h-4 w-4" />
        {title}
      </span>
      <CollapseIcon className="h-4 w-4" />
    </button>
  );
}

function App() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const shellRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [sceneBackdrop, setSceneBackdrop] = useState('soft');
  const [collapsedPanels, setCollapsedPanels] = useState({
    jewellery: false,
    design: false,
  });
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState(
    getStylePresetsForModel(DEFAULT_MODEL)[0]?.id || '',
  );

  const selectedModelConfig = JEWELRY_MODELS[selectedModel];
  const activeCategory = getCategoryForModel(selectedModel);
  const activeModels = activeCategory?.modelIds || [];
  const stylePresets = useMemo(
    () => getStylePresetsForModel(selectedModel),
    [selectedModel],
  );
  const selectedStyle =
    stylePresets.find((style) => style.id === selectedStyleId) ||
    stylePresets[0] ||
    null;

  useEffect(() => {
    const firstStyle = getStylePresetsForModel(selectedModel)[0];
    setSelectedStyleId(firstStyle?.id || '');
  }, [selectedModel]);

  useEffect(() => {
    let wasCompact = window.innerWidth <= 980;
    setIsCompactViewport(wasCompact);

    if (wasCompact) {
      setCollapsedPanels({ jewellery: false, design: true });
    }

    const syncViewport = () => {
      const nextCompact = window.innerWidth <= 980;
      setIsCompactViewport(nextCompact);

      if (nextCompact && !wasCompact) {
        setCollapsedPanels({ jewellery: false, design: true });
      }

      if (!nextCompact && wasCompact) {
        setCollapsedPanels({ jewellery: false, design: false });
      }

      wasCompact = nextCompact;
    };

    window.addEventListener('resize', syncViewport);
    return () => {
      window.removeEventListener('resize', syncViewport);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nextFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nextFullscreen);
      if (!nextFullscreen) setIsCleanMode(false);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return undefined;

    let isActive = true;

    const initializeApp = async () => {
      try {
        setIsLoading(true);
        const app = new ThreeApplication(canvasRef.current);

        if (isActive) {
          appRef.current = app;
          await app.initPromise;
          app.updateBackgroundTheme(false);
          app.lightingSystem?.toggleBackground(false);
          setIsRotating(Boolean(app.controls?.autoRotate));
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
        console.log('Cleaning up ThreeApplication instance');
        appRef.current.dispose();
        appRef.current = null;
      }
    };
  }, []);

  const hidePanel = useCallback((panel) => {
    setCollapsedPanels((current) => ({
      ...current,
      [panel]: true,
    }));
  }, []);

  const showPanel = useCallback((panel) => {
    setIsCleanMode(false);
    setCollapsedPanels((current) => ({
      ...current,
      [panel]: false,
      ...(isCompactViewport && panel === 'jewellery' ? { design: true } : {}),
      ...(isCompactViewport && panel === 'design' ? { jewellery: true } : {}),
    }));
  }, [isCompactViewport]);

  const handleModelChange = useCallback(async (modelId) => {
    if (!modelId || modelId === selectedModel) return;

    setIsLoading(true);
    setSelectedModel(modelId);
    setSelectedPart(null);
    window.selectedObject = null;

    try {
      await appRef.current?.loadModel(modelId);
      setIsRotating(Boolean(appRef.current?.controls?.autoRotate));
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  const handleCategorySelect = useCallback(
    (category) => {
      if (category.status === 'disabled') return;

      const nextModel = getFirstModelForCategory(category.id);
      if (nextModel) handleModelChange(nextModel);
    },
    [handleModelChange],
  );

  const setAutoRotate = useCallback((enabled) => {
    const controls = appRef.current?.controls || window.scene?.userData?.controls;
    if (!controls) return;

    controls.autoRotate = enabled;
    controls.autoRotateSpeed = 0.5;
    setIsRotating(enabled);
  }, []);

  const resetCamera = useCallback(() => {
    const loadedModel = getLoadedModel();
    const sceneManager = window.scene?.userData?.sceneManager;

    if (loadedModel && sceneManager) {
      sceneManager.updateCameraForModel(loadedModel);
    }
  }, []);

  const handleRotate = useCallback(() => {
    const nextRotation = !isRotating;
    setAutoRotate(nextRotation);

    const actions = appRef.current?.modelControls?.actions;
    if (actions) {
      actions.forEach((action) => {
        action.paused = false;
      });
    }
  }, [isRotating, setAutoRotate]);

  const handlePause = useCallback(() => {
    setAutoRotate(false);

    const actions = appRef.current?.modelControls?.actions;
    if (actions) {
      actions.forEach((action) => {
        action.paused = true;
      });
    }
  }, [setAutoRotate]);

  const handleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsCleanMode(false);
        return;
      }

      setIsCleanMode(true);
      await shellRef.current?.requestFullscreen?.();
    } catch (error) {
      console.error('Unable to toggle fullscreen:', error);
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    const app = appRef.current;
    const renderer = app?.renderer;
    if (!renderer) return;

    if (renderer.composer) {
      renderer.composer.render();
    } else if (app.scene && app.camera) {
      renderer.render(app.scene, app.camera);
    }

    renderer.domElement.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedModel}-configuration.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [selectedModel]);

  const handleStyleSelect = useCallback(
    (styleId) => {
      const style = stylePresets.find((item) => item.id === styleId);
      if (!style) return;

      const applied = applyJewelleryStyle(appRef.current, style);
      if (applied) setSelectedStyleId(style.id);
    },
    [stylePresets],
  );

  const handlePartSelect = (part) => {
    setSelectedPart(part);
  };

  const handleMetalChange = (metalType) => {
    appRef.current?.updateMaterial(metalType);
  };

  const handleFinishChange = (finish) => {
    appRef.current?.updateFinish(finish);
  };

  const handleColorChange = (hexColor) => {
    appRef.current?.updateColor(hexColor);
  };

  const handleGemChange = (gemType) => {
    appRef.current?.updateMaterial(gemType);
  };

  const handleGemColorChange = (hexColor) => {
    appRef.current?.updateColor(hexColor);
  };

  const handleHDRIRotation = (angle) => {
    appRef.current?.lightingSystem?.rotateEnvironment(angle);
  };

  const handleHDRIIntensity = (intensity) => {
    appRef.current?.lightingSystem?.updateEnvironmentMapIntensity(intensity);
  };

  const handleBackdropToggle = (show) => {
    setSceneBackdrop(show ? 'royal' : 'soft');
    appRef.current?.lightingSystem?.toggleBackground(show);
  };

  const controls = [
    {
      id: 'hero',
      label: 'Hero view',
      icon: Aperture,
      onClick: resetCamera,
    },
    {
      id: 'rotate',
      label: isRotating ? 'Stop rotate' : 'Rotate',
      icon: RotateCw,
      onClick: handleRotate,
      active: isRotating,
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: Pause,
      onClick: handlePause,
    },
    {
      id: 'fullscreen',
      label: isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
      icon: isFullscreen ? Minimize2 : Maximize2,
      onClick: handleFullscreen,
      active: isFullscreen,
    },
    {
      id: 'screenshot',
      label: 'Screenshot',
      icon: Camera,
      onClick: handleScreenshot,
    },
  ];

  const showJewelleryPanel = !isCleanMode && !collapsedPanels.jewellery;
  const showDesignPanel = !isCleanMode && !collapsedPanels.design;

  return (
    <div
      ref={shellRef}
      className={`jewellery-configurator jewellery-backdrop-${sceneBackdrop} ${isCleanMode ? 'is-clean' : ''}`}
    >
      <div className="jewellery-stage">
        <canvas ref={canvasRef} className="jewellery-canvas" />
      </div>

      <div className="jewellery-brand">
        <span>Jewellery Designer</span>
      </div>

      {showJewelleryPanel ? (
        <aside className="jewellery-panel jewellery-panel-left">
          <PanelHeader
            title="Jewellery"
            icon={Gem}
            side="left"
            onCollapse={() => hidePanel('jewellery')}
          />

          <div className="jewellery-category-list">
            {JEWELLERY_CATEGORIES.map((category) => {
              const active = category.id === activeCategory?.id;
              const disabled = category.status === 'disabled';
              const Icon = active ? CircleDot : Circle;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`jewellery-category-button ${
                    active ? 'is-active' : ''
                  } ${disabled ? 'is-disabled' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  disabled={disabled}
                  aria-pressed={active}
                >
                  <span>
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </span>
                  {disabled ? <em>Soon</em> : null}
                </button>
              );
            })}
          </div>

          <div className="jewellery-model-list">
            {activeModels.map((modelId) => {
              const model = JEWELRY_MODELS[modelId];
              const active = modelId === selectedModel;

              return (
                <button
                  key={modelId}
                  type="button"
                  className={`jewellery-model-button ${active ? 'is-active' : ''}`}
                  onClick={() => handleModelChange(modelId)}
                  aria-pressed={active}
                >
                  <span>{model.name}</span>
                  <small>{model.parts.length} parts</small>
                </button>
              );
            })}
          </div>
        </aside>
      ) : null}

      {showDesignPanel ? (
        <aside className="jewellery-panel jewellery-panel-right">
          <PanelHeader
            title="Design"
            icon={Sparkles}
            side="right"
            onCollapse={() => hidePanel('design')}
          />

          <div className="jewellery-design-summary">
            <div>
              <span>Model</span>
              <strong>{selectedModelConfig?.name || 'Jewellery'}</strong>
            </div>
            <div>
              <span>Part</span>
              <strong>{selectedPart?.name || 'All parts'}</strong>
            </div>
            <div>
              <span>Style</span>
              <strong>{selectedStyle?.name || 'Custom'}</strong>
            </div>
          </div>

          <div className="jewellery-design-scroll">
            <QuickStyleSelector
              selectedModel={selectedModel}
              selectedStyleId={selectedStyleId}
              onStyleSelect={handleStyleSelect}
            />

            <section className="jewellery-control-section">
              <PartSelector
                selectedPart={selectedPart}
                onPartSelect={handlePartSelect}
              />
            </section>

            {selectedPart ? (
              <section className="jewellery-control-section">
                {selectedPart.type === 'gem' ? (
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
                )}
              </section>
            ) : null}

            <section className="jewellery-control-section">
              <HDRIControls
                onRotationChange={handleHDRIRotation}
                onIntensityChange={handleHDRIIntensity}
                onBackgroundToggle={handleBackdropToggle}
              />
            </section>
          </div>
        </aside>
      ) : null}

      {(isCleanMode || collapsedPanels.jewellery) ? (
        <button
          type="button"
          className="jewellery-edge-tab jewellery-edge-tab-left"
          onClick={() => showPanel('jewellery')}
        >
          Jewellery
        </button>
      ) : null}

      {(isCleanMode || collapsedPanels.design) ? (
        <button
          type="button"
          className="jewellery-edge-tab jewellery-edge-tab-right"
          onClick={() => showPanel('design')}
        >
          Design
        </button>
      ) : null}

      <div className="jewellery-bottom-bar">
        <div className="jewellery-bottom-tools">
          {controls.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.id}
                type="button"
                className={`jewellery-tool-button ${
                  control.active ? 'is-active' : ''
                }`}
                onClick={control.onClick}
                aria-label={control.label}
                title={control.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {stylePresets.length ? (
          <div className="jewellery-variation-dots" aria-label="Style variations">
            {stylePresets.map((style, index) => (
              <button
                key={style.id}
                type="button"
                className={`jewellery-variation-dot ${
                  selectedStyleId === style.id ? 'is-active' : ''
                }`}
                onClick={() => handleStyleSelect(style.id)}
                aria-label={`Apply ${style.name}`}
                title={style.name}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="jewellery-loading-overlay">
          <div className="jewellery-loading-card">
            <div className="jewellery-loading-spinner" />
            <span>Loading model</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
