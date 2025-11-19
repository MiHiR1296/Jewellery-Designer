import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

// Default HDRI options optimized for jewelry
export const HDRI_OPTIONS = {
    jewelry_studio: {
        name: "Jewelry Studio",
        path: './assets/hdri/christmas_photo_studio_04_2k.exr',
        defaultIntensity: 0.7, // Reduced from 1.0 for more realistic lighting
        description: "Bright studio lighting ideal for jewelry"
    },
    // soft_gold: {
    //     name: "Soft Gold",
    //     path: './assets/hdri/soft_gold.exr',
    //     defaultIntensity: 0.8,
    //     description: "Warm lighting to enhance gold"
    // },
    // cool_silver: {
    //     name: "Cool Silver",
    //     path: './assets/hdri/cool_silver.exr',
    //     defaultIntensity: 0.7,
    //     description: "Cool lighting to enhance silver and platinum"
    // },
    // showroom: {
    //     name: "Showroom",
    //     path: './assets/hdri/showroom.exr',
    //     defaultIntensity: 0.9,
    //     description: "Elegant showroom lighting with subtle reflections"
    // }
};

// Lighting configuration optimized for jewelry
export const LIGHTING_CONFIG = {
    renderer: {
        toneMapping: 'ACESFilmicToneMapping',
        toneMappingExposure: 0.8, // Reduced from 1.2 to prevent overblown whites
        shadowMapType: 'PCFSoftShadowMap',
        physicallyCorrectLights: true,
        outputEncoding: 'sRGBEncoding',
        shadowMapSizeMultiplier: 2
    },
    environmentMap: {
        enabled: true,
        path: './assets/hdri/jewelry_studio.exr',
        intensity: 0.7, // Reduced from 1.0 for more realistic lighting
        envMapIntensity: 0.7,
        showBackground: false
    },
    shadowCatcher: {
        enabled: true,
        size: 20,
        opacity: 0.05,
        position: { x: 0, y: -0.001, z: 0 }
    },
    lights: {
        keyLight: {
            type: 'SpotLight',
            enabled: true,
            position: { x: 5, y: 8, z: 5 },
            intensity: 60, // Reduced from 100 to prevent overblown highlights
            color: 0xffffff,
            angle: Math.PI / 4,
            penumbra: 0.5,
            distance: 25,
            castShadow: true,
            shadowMapSize: 1024,
            shadowBias: -0.0001,
            normalBias: 0.001,
            shadowRadius: 15
        },
        fillLight: {
            type: 'SpotLight',
            enabled: true,
            position: { x: -5, y: 8, z: -3 },
            intensity: 30, // Reduced from 50
            color: 0xffffee, // Slightly warm for gold
            angle: Math.PI / 4,
            penumbra: 1,
            distance: 25,
            castShadow: false
        },
        rimLight: {
            type: 'SpotLight',
            enabled: true,
            position: { x: 0, y: 5, z: -8 },
            intensity: 40, // Reduced from 67
            color: 0xffffff,
            angle: Math.PI / 4,
            penumbra: 1,
            distance: 25,
            castShadow: false
        },
        ambientLight: {
            type: 'HemisphereLight',
            enabled: true,
            skyColor: 0xffffff,
            groundColor: 0x303030,
            intensity: 0.1
        }
    }
};

export class LightingSystem {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.lights = new Map();
        this.helpers = new Map();
        this.envMap = null;
        this.background = null;
        this.currentHDRI = null;
        this.environmentRotation = 0;
        this.defaultBackground = new THREE.Color(0x1a1a1a);
        this.showHDRIBackground = false;
        this.currentEnvironmentMap = null;
        this.currentIntensity = LIGHTING_CONFIG.environmentMap.intensity;
        this.isDarkMode = true; // Default to dark mode
        
        this.setupRenderer();
        this.initializeEnvironmentMap(this.currentIntensity);
        this.setupShadowCatcher();
        this.setupLights();
        
        // Load the default HDRI after initialization
        // Use a short timeout to ensure the scene is fully set up
        setTimeout(() => {
            const defaultHDRI = HDRI_OPTIONS['jewelry_studio'];
            if (defaultHDRI) {
                this.loadHDRI(defaultHDRI.path, defaultHDRI.defaultIntensity);
                console.log('Default HDRI loaded:', defaultHDRI.name);
            }
        }, 100);
    }

    createGradientBackground(isDarkMode = true) {
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;

        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 2);
        
        if (isDarkMode) {
            // Dark gradient for dark mode - enhances jewelry shine
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(0.5, '#121212');
            gradient.addColorStop(0.9, '#000000');
        } else {
            // Light gradient for light mode - softer, brighter background
            gradient.addColorStop(0, '#f5f5f5');
            gradient.addColorStop(0.5, '#e8e8e8');
            gradient.addColorStop(0.9, '#d0d0d0');
        }

        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 2);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    setupRenderer() {
        const config = LIGHTING_CONFIG.renderer;
        
        this.renderer.toneMapping = THREE[config.toneMapping];
        this.renderer.toneMappingExposure = config.toneMappingExposure;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE[config.shadowMapType];
        
        // Replace deprecated physicallyCorrectLights with correct property
        // this.renderer.physicallyCorrectLights = true; // Deprecated
        
        // THREE.js r155+ uses this instead:
        this.renderer.useLegacyLights = false;
        
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    async loadHDRI(path, intensity) {
        if (!path) return;

        try {
            const texture = await new Promise((resolve, reject) => {
                new EXRLoader().load(
                    path,
                    resolve,
                    undefined,
                    reject
                );
            });

            texture.mapping = THREE.EquirectangularReflectionMapping;
            
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            
            // Store the environment map
            if (this.currentEnvironmentMap) {
                this.currentEnvironmentMap.dispose();
            }
            this.currentEnvironmentMap = envMap;

            // Always set the environment map for reflections
            this.scene.environment = envMap;

            // Only set as background if showHDRIBackground is true
            if (this.showHDRIBackground) {
                this.scene.background = envMap;
            }

            // Determine which intensity to use
            const intensityToUse = intensity !== undefined ? intensity : 
                this.currentIntensity !== undefined ? this.currentIntensity :
                LIGHTING_CONFIG.environmentMap.intensity;
                             
            // Store and apply the determined intensity
            this.currentIntensity = intensityToUse;
            this.updateEnvironmentMapIntensity(intensityToUse);

            // Apply any existing rotation after setting the new environment
            if (this.environmentRotation) {
                this.rotateEnvironment(this.environmentRotation);
            }

            texture.dispose();
            pmremGenerator.dispose();

            console.log(`HDRI loaded with intensity: ${intensityToUse}`);

        } catch (error) {
            console.error('Error loading HDRI:', error);
        }
    }

    rotateEnvironment(angle) {
        this.environmentRotation = angle;
        
        // Convert degrees to radians
        const radians = THREE.MathUtils.degToRad(angle);
        
        // Find the camera and controls
        const camera = this.scene.userData.camera;
        const controls = this.scene.userData.controls;
        if (!camera || !controls) {
            console.warn("Camera or controls not found for rotation");
            return;
        }
        
        // Find the model
        let modelGroup = null;
        this.scene.traverse((object) => {
            if (object.userData && object.userData.isLoadedModel) {
                modelGroup = object;
            }
        });
        
        // If no model found, rotate the camera around the origin
        if (!modelGroup) {
            const origin = new THREE.Vector3(0, 0, 0);
            
            // Store initial positions if not already stored
            if (!this.initialCameraPosition) {
                this.initialCameraPosition = camera.position.clone();
                this.initialControlsTarget = controls.target.clone();
            }
            
            // Calculate relative position from origin
            const relativePosition = this.initialCameraPosition.clone();
            
            // Rotate the camera around the origin
            const rotatedPosition = relativePosition.clone();
            rotatedPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), -radians);
            
            // Update camera position
            camera.position.copy(rotatedPosition);
            
            // Update controls
            controls.update();
            
            return;
        }
        
        // Calculate the model's center as the pivot point
        const modelCenter = new THREE.Vector3();
        const modelBox = new THREE.Box3().setFromObject(modelGroup);
        modelBox.getCenter(modelCenter);
        
        // Store initial positions if not already stored
        if (!this.initialCameraPosition) {
            this.initialCameraPosition = camera.position.clone();
            this.initialControlsTarget = controls.target.clone();
            this.initialModelRotation = modelGroup.rotation.y;
        }
        
        // Calculate the initial relative camera position from the model center
        const relativePosition = this.initialCameraPosition.clone().sub(modelCenter);
        
        // Rotate the camera around the model center
        const rotatedPosition = relativePosition.clone();
        rotatedPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), -radians);
        rotatedPosition.add(modelCenter);
        
        // Update camera position
        camera.position.copy(rotatedPosition);
        
        // Keep the camera's target on the model center
        controls.target.copy(modelCenter);
        
        // Rotate the model in the same direction for consistent movement
        modelGroup.rotation.y = this.initialModelRotation - radians;
        
        // Update the controls
        controls.update();
    }

    toggleBackground(show) {
        this.showHDRIBackground = show;
        
        if (show && this.currentEnvironmentMap) {
            this.scene.background = this.currentEnvironmentMap;
            console.log("Showing HDRI background");
        } else {
            // Use gradient background with current theme
            const isDarkMode = this.isDarkMode !== undefined ? this.isDarkMode : true;
            this.scene.background = this.createGradientBackground(isDarkMode);
            console.log("Showing gradient background");
        }
    }

    // Update background based on theme
    updateBackgroundTheme(isDarkMode) {
        this.isDarkMode = isDarkMode;
        
        // Only update if HDRI background is not showing
        if (!this.showHDRIBackground) {
            this.scene.background = this.createGradientBackground(isDarkMode);
            console.log(`Background updated for ${isDarkMode ? 'dark' : 'light'} mode`);
        }
    }
   
   // Updated initializeEnvironmentMap in lighting.js
initializeEnvironmentMap(intensity) {
    if (!LIGHTING_CONFIG.environmentMap.enabled) {
        this.scene.environment = null;
        this.scene.background = null;
        return;
    }
    
    // Determine which intensity to use (provided, or from config)
    const intensityToUse = intensity !== undefined ? intensity : LIGHTING_CONFIG.environmentMap.intensity;
    
    // Store the intensity we'll be using
    this.currentIntensity = intensityToUse;
    console.log(`Setting up placeholder environment map with intensity: ${intensityToUse}`);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a placeholder until actual HDRIs are loaded
    // This allows the scene to render properly while waiting for the HDRI to load
    const placeholderEnvMap = this.createPlaceholderEnvironmentMap(pmremGenerator);
    
    // Set as environment always
    this.scene.environment = placeholderEnvMap;
    
    // Only set as background if showHDRIBackground is true
    if (this.showHDRIBackground) {
        this.scene.background = placeholderEnvMap;
    } else {
        // Use gradient background as fallback with current theme
        const isDarkMode = this.isDarkMode !== undefined ? this.isDarkMode : true;
        this.scene.background = this.createGradientBackground(isDarkMode);
    }
    
    // Set initial intensity using the stored value
    this.updateEnvironmentMapIntensity(this.currentIntensity);
    
    // Store for later reference
    this.currentEnvironmentMap = placeholderEnvMap;
    this.environmentRotation = 0;
    
    console.log("Placeholder environment map initialized. Default HDRI will be loaded shortly.");
}

    createPlaceholderEnvironmentMap(pmremGenerator) {
        // Create a simple colored cube map
        const size = 256;
        const data = new Uint8Array(size * size * 4);
        
        // Fill with a gradient from dark blue to light blue
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const idx = (i * size + j) * 4;
                // Gradient colors suitable for jewelry
                data[idx] = 40 + (i * 40 / size);      // R: dark to light
                data[idx + 1] = 40 + (i * 40 / size);  // G: dark to light
                data[idx + 2] = 60 + (i * 80 / size);  // B: more blue for nice reflections
                data[idx + 3] = 255;                   // A: full opacity
            }
        }
        
        // Create texture
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        texture.needsUpdate = true;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Generate PMREM from the texture
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        // Clean up
        texture.dispose();
        
        return envMap;
    }

    updateEnvironmentMapIntensity(value) {
        // Safety check for invalid values
        if (value === undefined || value === null || isNaN(value)) {
            console.warn('Invalid intensity value:', value, 'using default:', LIGHTING_CONFIG.environmentMap.intensity);
            value = LIGHTING_CONFIG.environmentMap.intensity;
        }
        
        // Store the current intensity
        this.currentIntensity = value;
        
        // Update config
        LIGHTING_CONFIG.environmentMap.envMapIntensity = value;
        LIGHTING_CONFIG.environmentMap.intensity = value;
        
        // Log current state for debugging
        console.log(`Updating environment map intensity to ${value}`);
        
        // Update all materials in the scene
        let updatedMaterials = 0;
        this.scene.traverse((object) => {
            if (object.isMaterial) {
                object.envMapIntensity = value;
                object.needsUpdate = true;
                updatedMaterials++;
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        if (mat.envMapIntensity !== undefined) {
                            mat.envMapIntensity = value;
                            mat.needsUpdate = true;
                            updatedMaterials++;
                        }
                    });
                } else if (object.material.envMapIntensity !== undefined) {
                    object.material.envMapIntensity = value;
                    object.material.needsUpdate = true;
                    updatedMaterials++;
                }
            }
        });

        // Update the environment map if it exists
        if (this.envMap) {
            this.envMap.intensity = value;
        }
        
        if (this.scene.environment) {
            // For Three.js environment maps that support intensity
            this.scene.environment.intensity = value;
        }

        console.log(`Environment map intensity updated: ${value} (${updatedMaterials} materials updated)`);
    }
  
    createSpotLight(config) {
        const light = new THREE.SpotLight(config.color, config.intensity);
        light.position.set(config.position.x, config.position.y, config.position.z);
        
        light.angle = config.angle;
        light.penumbra = config.penumbra;
        light.decay = 2;
        light.distance = config.distance;
        
        if (config.castShadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = config.shadowMapSize;
            light.shadow.mapSize.height = config.shadowMapSize;
            light.shadow.bias = config.shadowBias;
            light.shadow.normalBias = config.normalBias;
            light.shadow.radius = config.shadowRadius;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = config.distance;
            light.shadow.camera.fov = THREE.MathUtils.radToDeg(config.angle) * 2;
            light.shadow.camera.updateProjectionMatrix();
        }

        const target = new THREE.Object3D();
        target.position.set(0, 0, 0);
        this.scene.add(target);
        light.target = target;

        return light;
    }

    setupLights() {
        this.lights.forEach(light => {
            if (light.target) this.scene.remove(light.target);
            this.scene.remove(light);
        });
        this.lights.clear();

        Object.entries(LIGHTING_CONFIG.lights).forEach(([name, config]) => {
            if (!config.enabled) return;

            let light;
            switch (config.type) {
                case 'SpotLight':
                    light = this.createSpotLight(config);
                    break;
                case 'HemisphereLight':
                    light = new THREE.HemisphereLight(
                        config.skyColor,
                        config.groundColor,
                        config.intensity
                    );
                    break;
            }

            if (light) {
                this.lights.set(name, light);
                this.scene.add(light);
            }
        });
    }

    setupShadowCatcher() {
        if (!LIGHTING_CONFIG.shadowCatcher.enabled) return;

        const config = LIGHTING_CONFIG.shadowCatcher;
        const geometry = new THREE.PlaneGeometry(config.size, config.size);
        const material = new THREE.ShadowMaterial({
            opacity: config.opacity,
            color: 0x000000,
            transparent: true,
            depthWrite: false
        });

        const shadowCatcher = new THREE.Mesh(geometry, material);
        shadowCatcher.rotation.x = -Math.PI / 2;
        shadowCatcher.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );
        shadowCatcher.receiveShadow = true;
        shadowCatcher.name = "shadowCatcher";
        this.scene.add(shadowCatcher);
    }

    update() {
        this.lights.forEach(light => {
            if (light.shadow && light.shadow.map) {
                light.shadow.map.needsUpdate = true;
            }
        });
        
        this.helpers.forEach(helper => {
            helper.update();
        });
    }

    dispose() {
        this.lights.forEach(light => {
            if (light.target) this.scene.remove(light.target);
            if (light.shadow?.map) {
                light.shadow.map.dispose();
            }
            this.scene.remove(light);
        });
        this.lights.clear();
    
        if (this.envMap) {
            this.envMap.dispose();
        }
        if (this.background) {
            this.background.dispose();
        }
        if (this.currentHDRI) {
            this.currentHDRI.dispose();
        }
        if (this.currentEnvironmentMap) {
            this.currentEnvironmentMap.dispose();
        }
    
        this.helpers.forEach(helper => {
            this.scene.remove(helper);
        });
        this.helpers.clear();
    
        this.scene.environment = null;
        this.scene.background = null;
    }
}