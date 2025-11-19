import * as THREE from 'three';

// Metal material presets
export const METAL_PRESETS = {
    gold: {
        color: 0xFFD700,
        roughness: 0.13,
        metalness: 1.0,
        envMapIntensity: 0.7, // Reduced from 1.0 to prevent overblown reflections
        clearcoat: 0.0,
        reflectivity: 1.0,
        ior: 2.5
    },
    silver: {
        color: 0xE0E0E0,
        roughness: 0.1,
        metalness: 1.0,
        envMapIntensity: 0.8, // Reduced from 1.2
        clearcoat: 0.0,
        reflectivity: 1.0,
        ior: 2.3
    },
    platinum: {
        color: 0xE5E4E2,
        roughness: 0.08,
        metalness: 1.0,
        envMapIntensity: 0.75, // Reduced from 1.1
        clearcoat: 0.0,
        reflectivity: 1.0,
        ior: 2.7
    },
    'rose-gold': {
        color: 0xF7C9B0,
        roughness: 0.15,
        metalness: 1.0,
        envMapIntensity: 0.65, // Reduced from 0.95
        clearcoat: 0.0,
        reflectivity: 1.0,
        ior: 2.5
    },
    bronze: {
        color: 0xCD7F32,
        roughness: 0.2,
        metalness: 0.9,
        envMapIntensity: 0.6, // Reduced from 0.9
        clearcoat: 0.0,
        reflectivity: 0.9,
        ior: 2.4
    },
    copper: {
        color: 0xB87333,
        roughness: 0.17,
        metalness: 0.9,
        envMapIntensity: 0.6, // Reduced from 0.85
        clearcoat: 0.0,
        reflectivity: 0.9,
        ior: 2.4
    }
};

// Gemstone material presets
export const GEM_PRESETS = {
    diamond: {
        color: 0xFFFFFF,
        roughness: 0.01,
        metalness: 0.1,
        transmission: 0.95,
        ior: 2.42,
        thickness: 4.0,
        envMapIntensity: 1.0, // Reduced from 1.6 to prevent overblown reflections
        clearcoat: 0.5,
        clearcoatRoughness: 0.01,
        reflectivity: 0.9,
        transparent: true,
        opacity: 0.9
    },
    ruby: {
        color: 0xE0115F,
        roughness: 0.07,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.77,
        thickness: 3.5,
        envMapIntensity: 0.85, // Reduced from 1.2
        clearcoat: 0.6,
        clearcoatRoughness: 0.05,
        reflectivity: 0.8,
        transparent: true,
        opacity: 0.9
    },
    sapphire: {
        color: 0x0F52BA,
        roughness: 0.07,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.77,
        thickness: 3.5,
        envMapIntensity: 0.85, // Reduced from 1.2
        clearcoat: 0.6,
        clearcoatRoughness: 0.05,
        reflectivity: 0.8,
        transparent: true,
        opacity: 0.9
    },
    emerald: {
        color: 0x50C878,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.82,
        ior: 1.57,
        thickness: 3.5,
        envMapIntensity: 0.8, // Reduced from 1.1
        clearcoat: 0.5,
        clearcoatRoughness: 0.08,
        reflectivity: 0.7,
        transparent: true,
        opacity: 0.9
    },
    amethyst: {
        color: 0x9966CC,
        roughness: 0.09,
        metalness: 0.05,
        transmission: 0.8,
        ior: 1.54,
        thickness: 3.0,
        envMapIntensity: 0.75, // Reduced from 1.0
        clearcoat: 0.4,
        clearcoatRoughness: 0.07,
        reflectivity: 0.7,
        transparent: true,
        opacity: 0.85
    },
    topaz: {
        color: 0xFFC87C,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.83,
        ior: 1.63,
        thickness: 3.0,
        envMapIntensity: 0.8, // Reduced from 1.1
        clearcoat: 0.5,
        clearcoatRoughness: 0.06,
        reflectivity: 0.75,
        transparent: true,
        opacity: 0.85
    }
};

// Material finishes
export const FINISH_PRESETS = {
    polished: {
        roughness: 0.15,
        clearcoat: 0.2,
        clearcoatRoughness: 0.01
    },
    satin: {
        roughness: 0.25,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
    },
    brushed: {
        roughness: 0.35,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3
    },
    hammered: {
        roughness: 0.5,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4
    },
    matte: {
        roughness: 0.7,
        clearcoat: 0.0,
        clearcoatRoughness: 0.5
    }
};

export class MaterialManager {
    constructor() {
        this.materials = {
            metals: new Map(),
            gems: new Map()
        };
        
        // Store texture loader for normal maps, etc.
        this.textureLoader = new THREE.TextureLoader();
        
        // Store currently selected material and finish
        this.currentMetal = 'gold';
        this.currentGem = 'diamond';
        this.currentFinish = 'polished';
        
        // Expose presets for access by ThreeApplication
        this.METAL_PRESETS = METAL_PRESETS;
        this.GEM_PRESETS = GEM_PRESETS;
        this.FINISH_PRESETS = FINISH_PRESETS;
        
        // Initialize cache
        this.initializeCache();
    }
    
    // Initialize material cache for quick access
    initializeCache() {
        // Pre-create common materials
        Object.keys(METAL_PRESETS).forEach(metal => {
            Object.keys(FINISH_PRESETS).forEach(finish => {
                this.createMetalMaterial(metal, finish);
            });
        });
        
        // Pre-create gem materials
        Object.keys(GEM_PRESETS).forEach(gem => {
            this.createGemMaterial(gem);
        });
    }
    
    // Create a material based on part type
    async createMaterialForType(materialType) {
        // Check if it's a metal
        if (METAL_PRESETS[materialType]) {
            return this.createMetalMaterial(materialType, this.currentFinish);
        }
        // Check if it's a gem
        else if (GEM_PRESETS[materialType]) {
            return this.createGemMaterial(materialType);
        }
        // Default to gold if unknown
        else {
            return this.createMetalMaterial('gold', 'polished');
        }
    }
    
    // Create metal material with specified finish
    createMetalMaterial(metalType = 'gold', finish = 'polished') {
        const cacheKey = `${metalType}_${finish}`;
        
        // Return from cache if available
        if (this.materials.metals.has(cacheKey)) {
            return this.materials.metals.get(cacheKey).clone();
        }
        
        // Get base preset
        const metalPreset = METAL_PRESETS[metalType] || METAL_PRESETS.gold;
        const finishPreset = FINISH_PRESETS[finish] || FINISH_PRESETS.polished;
        
        // Create material with combined properties
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(metalPreset.color),
            roughness: finishPreset.roughness,
            metalness: metalPreset.metalness,
            envMapIntensity: metalPreset.envMapIntensity,
            clearcoat: finishPreset.clearcoat,
            clearcoatRoughness: finishPreset.clearcoatRoughness,
            reflectivity: metalPreset.reflectivity,
            ior: metalPreset.ior,
            side: THREE.FrontSide
        });
        
        // Cache the material
        this.materials.metals.set(cacheKey, material);
        
        return material.clone();
    }
    
    // Create gemstone material
    createGemMaterial(gemType = 'diamond') {
        // Return from cache if available
        if (this.materials.gems.has(gemType)) {
            return this.materials.gems.get(gemType).clone();
        }
        
        // Get gem preset
        const gemPreset = GEM_PRESETS[gemType] || GEM_PRESETS.diamond;
        
        // Create material
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(gemPreset.color),
            roughness: gemPreset.roughness,
            metalness: gemPreset.metalness,
            transmission: gemPreset.transmission,
            ior: gemPreset.ior,
            thickness: gemPreset.thickness,
            envMapIntensity: gemPreset.envMapIntensity,
            clearcoat: gemPreset.clearcoat,
            clearcoatRoughness: gemPreset.clearcoatRoughness,
            reflectivity: gemPreset.reflectivity,
            transparent: gemPreset.transparent,
            opacity: gemPreset.opacity,
            side: THREE.FrontSide,
            // Fixed refraction issues by adding these settings
            attenuationDistance: 0.5,
            attenuationColor: new THREE.Color(gemPreset.color).multiplyScalar(0.8)
        });
        
        // Cache the material
        this.materials.gems.set(gemType, material);
        
        return material.clone();
    }
    
    // Update material on specified object or currently selected
    updateMaterial(materialType) {
        // Update current material type
        if (METAL_PRESETS[materialType]) {
            this.currentMetal = materialType;
        } else if (GEM_PRESETS[materialType]) {
            this.currentGem = materialType;
        }
        
        // Apply to selected object if available
        const selectedObject = window.selectedObject;
        if (selectedObject) {
            this.applyMaterialToObject(selectedObject);
        }
        
        // Apply to all objects of the same part type
        this.updateAllPartsOfType(selectedObject?.userData?.partType, materialType);
    }
    
    // Update finish on metal parts
    updateFinish(finish) {
        // Update current finish
        this.currentFinish = finish || 'polished';
        
        // Apply to selected object if it's a metal
        const selectedObject = window.selectedObject;
        if (selectedObject && selectedObject.userData?.partType === 'metal') {
            this.applyMaterialToObject(selectedObject);
        }
        
        // Apply to all metal parts
        this.updateAllPartsOfType('metal', this.currentMetal);
    }
    
    // Apply appropriate material to an object based on its part type
    applyMaterialToObject(object) {
        if (!object || !object.isMesh) return;
        
        const partType = object.userData?.partType || 'metal';
        
        if (partType === 'metal') {
            // Create metal material
            const material = this.createMetalMaterial(this.currentMetal, this.currentFinish);
            
            // Apply to object
            if (object.material) {
                object.material.dispose();
            }
            object.material = material;
            object.material.needsUpdate = true;
        }
        else if (partType === 'gem') {
            // Create gem material
            const material = this.createGemMaterial(this.currentGem);
            
            // Apply to object
            if (object.material) {
                object.material.dispose();
            }
            object.material = material;
            object.material.needsUpdate = true;
        }
    }
    
    // Update color on the selected object or current material
    updateColor(hexColor) {
        // Convert hex string to color
        const color = new THREE.Color(hexColor);
        
        // Apply to selected object
        const selectedObject = window.selectedObject;
        if (selectedObject && selectedObject.material) {
            selectedObject.material.color = color;
            selectedObject.material.needsUpdate = true;
            
            // If it's a metal, update the current metal color
            if (selectedObject.userData?.partType === 'metal') {
                METAL_PRESETS[this.currentMetal].color = color.getHex();
            }
            // If it's a gem, update the current gem color
            else if (selectedObject.userData?.partType === 'gem') {
                GEM_PRESETS[this.currentGem].color = color.getHex();
            }
        }
    }
    
    // Update all objects with matching part type
    updateAllPartsOfType(partType, materialType) {
        if (!partType || !materialType) return;
        
        // Find all objects in the scene with matching part type
        const objects = [];
        const scene = window.scene;
        
        if (scene) {
            scene.traverse(object => {
                if (object.isMesh && object.userData.partType === partType) {
                    objects.push(object);
                }
            });
        }
        
        // Apply material to all matching objects
        objects.forEach(object => {
            this.applyMaterialToObject(object);
        });
    }
    
    // Dispose of all materials to avoid memory leaks
    dispose() {
        // Dispose metals
        this.materials.metals.forEach(material => {
            material.dispose();
        });
        this.materials.metals.clear();
        
        // Dispose gems
        this.materials.gems.forEach(material => {
            material.dispose();
        });
        this.materials.gems.clear();
    }
}