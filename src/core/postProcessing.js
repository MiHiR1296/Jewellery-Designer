import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

// Post-processing settings specifically tuned for jewelry
const JEWELRY_SETTINGS = {
    bloom: {
        strength: 0.3,     // Stronger bloom for highlights on metals
        radius: 0.6,       // Larger bloom radius for softer glow
        threshold: 0.55    // Lower threshold to catch more highlights
    },
    sao: {
        intensity: 0.2,    // Less intensity to avoid darkening metals
        scale: 1.0,
        bias: 0.2,
        kernelRadius: 16,  // Smaller radius for finer detail
        minResolution: 32,
        blurRadius: 3
    },
    vignette: {
        offset: 1.1,       // Reduced vignette effect
        darkness: 0.7      // Softer vignette for jewelry
    },
    contrast: {
        brightness: 0.05,  // Slight brightness boost
        contrast: 0.15     // Increased contrast for metals and gems
    }
};

export class PostProcessing {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Initialize effect composer with proper render target
        this.composer = new EffectComposer(renderer);
        
        this.setupPasses();
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupPasses() {
        // Basic render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Get the current renderer size
        const renderSize = new THREE.Vector2();
        this.renderer.getSize(renderSize);
        
        // Add SAO pass for ambient occlusion - tuned for jewelry
        const saoPass = new SAOPass(this.scene, this.camera, false, true);
        saoPass.params.output = SAOPass.OUTPUT.Default;
        saoPass.params.saoBias = JEWELRY_SETTINGS.sao.bias;
        saoPass.params.saoIntensity = JEWELRY_SETTINGS.sao.intensity;
        saoPass.params.saoScale = JEWELRY_SETTINGS.sao.scale;
        saoPass.params.saoKernelRadius = JEWELRY_SETTINGS.sao.kernelRadius;
        saoPass.params.saoMinResolution = JEWELRY_SETTINGS.sao.minResolution;
        saoPass.params.saoBlur = true;
        saoPass.params.saoBlurRadius = JEWELRY_SETTINGS.sao.blurRadius;
        saoPass.params.saoBlurStdDev = 2;
        saoPass.params.saoBlurDepthCutoff = 0.01;
        
        // Ensure same size as renderer
        saoPass.setSize(renderSize.width, renderSize.height);
        
        this.composer.addPass(saoPass);
        
        // Bloom effect for jewelry highlights
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(renderSize.width, renderSize.height),
            JEWELRY_SETTINGS.bloom.strength,
            JEWELRY_SETTINGS.bloom.radius,
            JEWELRY_SETTINGS.bloom.threshold
        );
        this.composer.addPass(bloomPass);
        
        // Gamma correction for natural color appearance
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(gammaCorrectionPass);
        
        // Brightness & contrast adjustment
        const brightnessContrastPass = new ShaderPass(BrightnessContrastShader);
        brightnessContrastPass.uniforms.brightness.value = JEWELRY_SETTINGS.contrast.brightness;
        brightnessContrastPass.uniforms.contrast.value = JEWELRY_SETTINGS.contrast.contrast;
        this.composer.addPass(brightnessContrastPass);
        
        // Vignette effect 
        const vignettePass = new ShaderPass(VignetteShader);
        vignettePass.uniforms.offset.value = JEWELRY_SETTINGS.vignette.offset;
        vignettePass.uniforms.darkness.value = JEWELRY_SETTINGS.vignette.darkness;
        this.composer.addPass(vignettePass);
        
        // SMAA for smooth anti-aliasing
        const smaaPass = new SMAAPass(
            renderSize.width * this.renderer.getPixelRatio(),
            renderSize.height * this.renderer.getPixelRatio()
        );
        this.composer.addPass(smaaPass);
        
        // Store references
        this.saoPass = saoPass;
        this.bloomPass = bloomPass;
        
        // Extra handling to ensure all passes are properly sized
        this.onWindowResize();
    }
    
    // Method to toggle SAO on/off
    toggleSAO(enabled) {
        if (this.saoPass) {
            this.saoPass.enabled = enabled;
        }
    }
    
    // Method to toggle Bloom on/off
    toggleBloom(enabled) {
        if (this.bloomPass) {
            this.bloomPass.enabled = enabled;
        }
    }
    
    // Method to adjust Bloom settings for different metals
    adjustBloomForMetal(metalType) {
        if (!this.bloomPass) return;
        
        switch(metalType) {
            case 'gold':
                this.bloomPass.strength = 0.135;
                this.bloomPass.radius = 0.26;
                this.bloomPass.threshold = 0.55;
                break;
            case 'silver':
                this.bloomPass.strength = 0.14;
                this.bloomPass.radius = 0.25;
                this.bloomPass.threshold = 0.5;
                break;
            case 'platinum':
                this.bloomPass.strength = 0.13;
                this.bloomPass.radius = 0.24;
                this.bloomPass.threshold = 0.6;
                break;
            case 'rose-gold':
                this.bloomPass.strength = 0.13;
                this.bloomPass.radius = 0.37;
                this.bloomPass.threshold = 0.5;
                break;
            default:
                // Reset to default jewelry settings
                this.bloomPass.strength = JEWELRY_SETTINGS.bloom.strength;
                this.bloomPass.radius = JEWELRY_SETTINGS.bloom.radius;
                this.bloomPass.threshold = JEWELRY_SETTINGS.bloom.threshold;
        }
    }
    
    // Method to adjust SAO parameters
    updateSAOSettings(settings) {
        if (this.saoPass && this.saoPass.params) {
            if (settings.saoIntensity !== undefined) {
                this.saoPass.params.saoIntensity = settings.saoIntensity;
            }
            if (settings.saoScale !== undefined) {
                this.saoPass.params.saoScale = settings.saoScale;
            }
            if (settings.saoKernelRadius !== undefined) {
                this.saoPass.params.saoKernelRadius = settings.saoKernelRadius;
            }
            if (settings.saoBlurRadius !== undefined) {
                this.saoPass.params.saoBlurRadius = settings.saoBlurRadius;
            }
        }
    }
    
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        // Make sure composer and all passes have the same size
        this.composer.setSize(width, height);
        
        // Manually update size for each pass if needed
        const renderSize = new THREE.Vector2();
        this.renderer.getSize(renderSize);
        
        if (this.saoPass) {
            this.saoPass.setSize(renderSize.width, renderSize.height);
        }
        
        if (this.bloomPass) {
            this.bloomPass.resolution.set(renderSize.width, renderSize.height);
        }
    }
}