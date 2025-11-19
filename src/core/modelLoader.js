import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Simplified model configuration for jewelry
export const JEWELRY_MODELS = {
    'eclipse_ruby_ring': {
        name: "Eclipse Ruby Ring",
        path: './assets/models/Eclipse_Ruby_Ring.glb',
        scale: 1.0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        parts: ['Ring', 'Ruby', 'Ruby_Base'],
        type: 'ring',
        materials: {
            'Ring': 'metal',
            'Ruby_Base': 'metal',
            'Ruby': 'gem'
        },
        defaultMaterials: {
            'Ring': 'gold',
            'Ruby_Base': 'gold',
            'Ruby': 'ruby'
        }
    },
    'diamond_ring': {
        name: "Diamond Ring",
        path: './assets/models/Diamond_Ring.glb',
        scale: 1.0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        parts: ['Ring', 'Diamond', 'Setting', 'Band'],
        type: 'ring',
        materials: {
            'Ring': 'metal',
            'Setting': 'metal',
            'Band': 'metal',
            'Diamond': 'gem'
        },
        defaultMaterials: {
            'Ring': 'gold',
            'Setting': 'gold',
            'Band': 'gold',
            'Diamond': 'diamond'
        }
    },
    'diamond_earrings': {
        name: "Diamond Earrings",
        path: './assets/models/Diamond_Earrings.glb',
        scale: 1.0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        parts: ['Earrings', 'Diamonds'],
        type: 'earrings',
        materials: {
            'Earrings': 'metal',
            'Diamonds': 'gem'
        },
        defaultMaterials: {
            'Earrings': 'gold',
            'Diamonds': 'diamond'
        }
    }
};

// ModelControls class for animations if needed
export class ModelControls {
    constructor() {
        this.mixers = new Set();
        this.actions = new Set();
        this.isPlaying = false;
    }

    addAction(mixer, action) {
        if (mixer && action) {
            this.mixers.add(mixer);
            this.actions.add(action);
        }
    }

    playAllAnimations() {
        if (this.isPlaying) {
            return;
        }

        const uniqueActions = Array.from(this.actions);
        
        uniqueActions.forEach(action => {
            if (action) {
                action.paused = false;
                action.reset();
                action.setEffectiveTimeScale(1);
                action.setEffectiveWeight(1);
                action.play();
            }
        });

        this.isPlaying = true;
    }

    clearMixers() {
        this.isPlaying = false;
        
        this.actions.forEach(action => {
            if (action) {
                action.stop();
            }
        });
        
        this.mixers.forEach(mixer => {
            if (mixer) {
                mixer.stopAllAction();
                mixer.uncacheRoot(mixer.getRoot());
            }
        });

        this.mixers.clear();
        this.actions.clear();
    }

    getCurrentMixers() {
        return Array.from(this.mixers);
    }
}

export class ModelLoader {
    constructor(scene, loadingManager, sceneManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.sceneManager = sceneManager;
        this.modelControls = new ModelControls();
        
        // Initialize loaders
        this.gltfLoader = new GLTFLoader(loadingManager.createThreeJSManager());
        
        // Initialize Draco decoder for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        this.currentModel = null;
        this.loadedModelGroup = null;
        this.basePath = './'; // Default base path
    }

    async loadModel(modelId, materialManager) {
        try {
            const modelConfig = JEWELRY_MODELS[modelId];
            if (!modelConfig) {
                throw new Error(`Invalid model selection: ${modelId}`);
            }
    
            // Set global variables for access by other components
            window.currentModel = modelId;
            window.currentModelConfig = modelConfig;
            
            // Clear any existing model
            await this.clearCurrentModel();
    
            // Create a group to hold the model
            this.loadedModelGroup = new THREE.Group();
            this.loadedModelGroup.userData.isLoadedModel = true;
            this.scene.add(this.loadedModelGroup);
    
            // Start loading
            this.loadingManager.startLoading(1);
            this.loadingManager.updateLog(`Loading ${modelConfig.name}...`);
            
            // Load the model
            const gltf = await this.loadModelFile(modelConfig.path);
            
            // Process loaded model
            await this.processLoadedModel(gltf, modelConfig, materialManager);
            
            // Add loaded model to group
            this.loadedModelGroup.add(gltf.scene);
            
            // Apply transformations from config
            if (modelConfig.scale) {
                this.loadedModelGroup.scale.set(
                    modelConfig.scale, 
                    modelConfig.scale, 
                    modelConfig.scale
                );
            }
            
            if (modelConfig.position) {
                this.loadedModelGroup.position.set(
                    modelConfig.position.x || 0,
                    modelConfig.position.y || 0,
                    modelConfig.position.z || 0
                );
            }
            
            if (modelConfig.rotation) {
                this.loadedModelGroup.rotation.set(
                    modelConfig.rotation.x || 0,
                    modelConfig.rotation.y || 0,
                    modelConfig.rotation.z || 0
                );
            }
            
            // Handle animations if present
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                
                gltf.animations.forEach(animation => {
                    const action = mixer.clipAction(animation);
                    this.modelControls.addAction(mixer, action);
                });
                
                this.modelControls.playAllAnimations();
            }
    
            // Calculate center and update camera
            const center = this.sceneManager.calculateSceneCenter();
            this.sceneManager.updateControlsTarget(center);
            this.sceneManager.updateCameraForModel(this.loadedModelGroup);
            
            // Apply default materials if specified
            if (modelConfig.defaultMaterials && materialManager) {
                await this.applyDefaultMaterials(modelConfig, materialManager);
            }
            
            // Success!
            this.loadingManager.itemLoaded();
            this.loadingManager.updateLog(`Loaded ${modelConfig.name}`);
            
            // Dispatch model loaded event
            window.dispatchEvent(new CustomEvent('model-loaded', { 
                detail: { 
                    modelId, 
                    modelConfig 
                } 
            }));
            
            return this.modelControls;
        } catch (error) {
            console.error('Error loading model:', error);
            this.loadingManager.updateLog(`Error: ${error.message}`);
            throw error;
        } finally {
            this.loadingManager.hide();
        }
    }
    
    async loadModelFile(path) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                resolve,
                (progress) => {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    this.loadingManager.updateProgress(percentComplete);
                },
                reject
            );
        });
    }
    
    async processLoadedModel(gltf, modelConfig, materialManager) {
        // Map to store materials by part name
        const partMaterials = new Map();
        
        // Process meshes in the model
        gltf.scene.traverse(async (object) => {
            if (object.isMesh) {
                // Ensure proper shadows
                object.castShadow = true;
                object.receiveShadow = true;
                
                // Store user data for reference
                object.userData.isImported = true;
                
                // Try to determine which part this mesh belongs to
                const partName = this.getPartName(object.name, modelConfig);
                if (partName) {
                    object.userData.partName = partName;
                    object.userData.partType = modelConfig.materials[partName] || 'metal';
                    
                    // Create default material if requested
                    if (materialManager && modelConfig.defaultMaterials[partName]) {
                        const materialType = modelConfig.defaultMaterials[partName];
                        
                        // Check if we've already created this material
                        if (!partMaterials.has(partName)) {
                            const material = await materialManager.createMaterialForType(materialType);
                            partMaterials.set(partName, material);
                        }
                        
                        // Apply material from cache
                        object.material = partMaterials.get(partName);
                    }
                }
                
                // Ensure we have proper vertex normals for better lighting
                object.geometry.computeVertexNormals();
            }
        });
        
        // Mark the entire gltf.scene as a loaded model for easier detection
        gltf.scene.userData.isLoadedModel = true;
        gltf.scene.name = modelConfig.name || 'Loaded Model';
        
        console.log(`Processed model: ${modelConfig.name}`, gltf.scene);
    }
    
    async applyDefaultMaterials(modelConfig, materialManager) {
        if (!this.loadedModelGroup) return;
        
        const materialPromises = [];
        const partMaterials = new Map();
        
        // Create all materials first
        for (const [partName, materialType] of Object.entries(modelConfig.defaultMaterials)) {
            const promise = materialManager.createMaterialForType(materialType)
                .then(material => {
                    partMaterials.set(partName, material);
                });
            materialPromises.push(promise);
        }
        
        // Wait for all materials to be created
        await Promise.all(materialPromises);
        
        // Apply materials to meshes
        this.loadedModelGroup.traverse((object) => {
            if (object.isMesh) {
                const partName = this.getPartName(object.name, modelConfig);
                if (partName && partMaterials.has(partName)) {
                    object.material = partMaterials.get(partName);
                    object.material.needsUpdate = true;
                }
            }
        });
    }
    
    getPartName(objectName, modelConfig) {
        // Check for exact match first (case-sensitive)
        if (modelConfig.parts.includes(objectName)) {
            return objectName;
        }
        
        // Convert to lowercase for case-insensitive matching
        const name = objectName.toLowerCase();
        
        // Check each defined part in the model config
        for (const part of modelConfig.parts) {
            const partLower = part.toLowerCase();
            
            // Check if the object name contains this part name
            if (name.includes(partLower)) {
                return part;
            }
        }
        
        // Try to match by common jewelry part names if not found
        const commonParts = {
            'band': ['band', 'ring', 'shank'],
            'gem': ['gem', 'diamond', 'stone', 'jewel', 'ruby', 'sapphire', 'emerald'],
            'setting': ['setting', 'prong', 'bezel', 'base']
        };
        
        for (const [partName, keywords] of Object.entries(commonParts)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return partName;
            }
        }
        
        // If no match, return null
        return null;
    }
    
    async clearCurrentModel() {
        return new Promise((resolve) => {
            // Remove ALL existing models first
            const modelsToRemove = [];
            this.scene.traverse((object) => {
                if (object.userData && object.userData.isLoadedModel) {
                    modelsToRemove.push(object);
                    console.log("Found model to remove:", object.name || "unnamed model");
                }
            });
            
            // Remove all found models
            for (const model of modelsToRemove) {
                // Dispose of geometries and materials
                model.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) {
                            object.geometry.dispose();
                        }
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => {
                                    if (material.map) material.map.dispose();
                                    material.dispose();
                                });
                            } else {
                                if (object.material.map) object.material.map.dispose();
                                object.material.dispose();
                            }
                        }
                    }
                });
                
                // Remove from scene
                this.scene.remove(model);
            }
            
            // Then also remove any specific loadedModelGroup
            if (this.loadedModelGroup) {
                // Stop any animations
                this.modelControls.clearMixers();
                
                // Remove from scene
                this.scene.remove(this.loadedModelGroup);
                this.loadedModelGroup = null;
            }
            
            // Short delay to ensure disposal completes
            setTimeout(resolve, 100);
        });
    }
    
    dispose() {
        this.clearCurrentModel();
        
        // Clean up DRACOLoader
        if (this.gltfLoader.dracoLoader) {
            this.gltfLoader.dracoLoader.dispose();
        }
    }
}