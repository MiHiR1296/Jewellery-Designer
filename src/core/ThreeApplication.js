import * as THREE from 'three';
import { SceneManager } from './sceneSetup';
import { LightingSystem } from './lighting';
import { PostProcessing } from './postProcessing';
import { LoadingManager } from './loadingManager';
import { ModelLoader } from './modelLoader';
import { MaterialManager } from './materialManager';
import { animate } from './Animation';

export default class ThreeApplication {
    constructor(canvas) {
        this.canvas = canvas;
        this.loadingManager = new LoadingManager();
        this.materialManager = new MaterialManager();
        
        // Store a promise that will resolve when initialization is complete
        this.initPromise = this.initialize();
    }
    
    async initialize() {
        try {
            console.log("Initializing ThreeApplication...");
            
            // Check if there's an existing ThreeJS scene in the global namespace
            if (window.scene) {
                console.warn("Existing scene detected in global namespace. This may indicate multiple instances.");
            }
            
            // Create scene, camera, renderer, controls
            this.sceneManager = new SceneManager(this.loadingManager, this.canvas);
            const { scene, camera, renderer, controls } = this.sceneManager.getComponents();
            
            this.scene = scene;
            this.camera = camera;
            this.renderer = renderer;
            this.controls = controls;
            
            // Store the scene globally for debugging and component access
            window.scene = this.scene;
            
            // Add references to camera and controls to scene's userData
            this.scene.userData.camera = this.camera;
            this.scene.userData.controls = this.controls;
            // Also add reference to sceneManager for key handlers
            this.scene.userData.sceneManager = this.sceneManager;
            
            // Setup lighting
            this.lightingSystem = new LightingSystem(this.scene, this.renderer);
            // Add reference to lighting system in scene's userData for key handlers
            this.scene.userData.lightingSystem = this.lightingSystem;
            
            // Setup post-processing
            this.postProcessor = new PostProcessing(this.scene, this.camera, this.renderer);
            this.renderer.composer = this.postProcessor.composer;
            
            // Create model loader
            this.modelLoader = new ModelLoader(this.scene, this.loadingManager, this.sceneManager);
            
            // Load default model (deferred, not blocking initialization)
            await this.loadDefaultModel(); // Changed to await to ensure model loads before continuing
            
            // Start animation loop
            animate(this.renderer, this.scene, this.camera, this.controls);
            
            console.log('ThreeApplication initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing ThreeApplication:', error);
            this.loadingManager.updateLog(`Error: ${error.message}`);
            throw error;
        }
    }
    
    async loadDefaultModel() {
        // Load the default model
        try {
            await this.loadModel('eclipse_ruby_ring');
            
            // Ensure environment and model coordinate properly
            if (this.lightingSystem) {
                // Update environment with a small delay to ensure model is fully loaded
                setTimeout(() => {
                    this.lightingSystem.updateEnvironmentMapIntensity(1.0);
                    console.log("Environment updated after model load");
                }, 300);
            }
        } catch (error) {
            console.error('Failed to load default model:', error);
        }
    }
    
    async loadModel(modelId) {
        if (!this.modelLoader) return;
        
        try {
            this.modelControls = await this.modelLoader.loadModel(modelId, this.materialManager);
            return this.modelControls;
        } catch (error) {
            console.error('Error loading model:', error);
            throw error;
        }
    }
    
    // Update material on selected object
    updateMaterial(materialType) {
        // Safety check
        if (!this.materialManager) return;
        
        try {
            // Check if materialType is valid
            const isValidMetal = this.materialManager.METAL_PRESETS && materialType in this.materialManager.METAL_PRESETS;
            const isValidGem = this.materialManager.GEM_PRESETS && materialType in this.materialManager.GEM_PRESETS;
            
            if (!isValidMetal && !isValidGem) {
                console.warn(`Unknown material type: ${materialType}`);
                return;
            }
            
            // Update material
            this.materialManager.updateMaterial(materialType);
        } catch (error) {
            console.error('Error updating material:', error);
        }
    }
    
    // Update finish on metal objects
    updateFinish(finish) {
        if (!this.materialManager) return;
        
        try {
            this.materialManager.updateFinish(finish);
        } catch (error) {
            console.error('Error updating finish:', error);
        }
    }
    
    // Update color on selected object
    updateColor(hexColor) {
        if (!this.materialManager) return;
        
        try {
            this.materialManager.updateColor(hexColor);
        } catch (error) {
            console.error('Error updating color:', error);
        }
    }
    
    dispose() {
        console.log("Disposing ThreeApplication...");
        
        // Stop animation loop (add a global flag to stop the animation loop)
        window.stopAnimation = true;
        
        // Dispose of all components
        if (this.modelLoader) {
            this.modelLoader.dispose();
        }
        
        if (this.materialManager) {
            this.materialManager.dispose();
        }
        
        if (this.lightingSystem) {
            this.lightingSystem.dispose();
        }
        
        if (this.postProcessor) {
            // Dispose of post-processing
            if (this.postProcessor.composer) {
                this.postProcessor.composer.passes.forEach(pass => {
                    if (pass.dispose) pass.dispose();
                });
            }
        }
        
        if (this.sceneManager) {
            this.sceneManager.dispose();
        }
        
        // Clear global references
        if (window.scene === this.scene) {
            window.scene = null;
        }
        
        console.log('ThreeApplication disposed');
    }
}