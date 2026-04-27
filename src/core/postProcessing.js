import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

// Post-processing settings specifically tuned for jewelry
const JEWELRY_SETTINGS = {
    bloom: {
        strength: 0.15,    // Reduced from 0.3 for more subtle, realistic highlights
        radius: 0.4,       // Reduced from 0.6 for tighter bloom
        threshold: 0.75    // Increased from 0.55 to only bloom very bright areas (prevents overblown whites)
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
        brightness: 0.0,   // No brightness boost to prevent overblown whites
        contrast: 0.25     // Increased from 0.15 for better depth and realism
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
        saoPass.enabled = false;
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
        
        // Brightness & contrast adjustment
        const brightnessContrastPass = new ShaderPass(BrightnessContrastShader);
        brightnessContrastPass.enabled = false;
        brightnessContrastPass.uniforms.brightness.value = JEWELRY_SETTINGS.contrast.brightness;
        brightnessContrastPass.uniforms.contrast.value = JEWELRY_SETTINGS.contrast.contrast;
        this.composer.addPass(brightnessContrastPass);
        
        // Vignette effect 
        const vignettePass = new ShaderPass(VignetteShader);
        vignettePass.enabled = false;
        vignettePass.uniforms.offset.value = JEWELRY_SETTINGS.vignette.offset;
        vignettePass.uniforms.darkness.value = JEWELRY_SETTINGS.vignette.darkness;
        this.composer.addPass(vignettePass);
        
        // Chromatic Aberration for diamond-like dispersion effect
        const chromaticAberrationShader = this.createChromaticAberrationShader();
        const chromaticAberrationPass = new ShaderPass(chromaticAberrationShader);
        chromaticAberrationPass.enabled = false;
        chromaticAberrationPass.uniforms.amount.value = 0.004; // Subtle effect, mainly visible on bright edges like diamonds
        this.composer.addPass(chromaticAberrationPass);
        this.chromaticAberrationPass = chromaticAberrationPass;

        // SMAA for smooth anti-aliasing
        const smaaPass = new SMAAPass(
            renderSize.width * this.renderer.getPixelRatio(),
            renderSize.height * this.renderer.getPixelRatio()
        );
        smaaPass.enabled = false;
        this.composer.addPass(smaaPass);

        // Bloom stays last because UnrealBloomPass composites directly into the output buffer.
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(renderSize.width, renderSize.height),
            JEWELRY_SETTINGS.bloom.strength,
            JEWELRY_SETTINGS.bloom.radius,
            JEWELRY_SETTINGS.bloom.threshold
        );
        bloomPass.enabled = false;
        this.composer.addPass(bloomPass);
        
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
                this.bloomPass.strength = 0.1;
                this.bloomPass.radius = 0.3;
                this.bloomPass.threshold = 0.75;
                break;
            case 'silver':
                this.bloomPass.strength = 0.12;
                this.bloomPass.radius = 0.3;
                this.bloomPass.threshold = 0.75;
                break;
            case 'platinum':
                this.bloomPass.strength = 0.1;
                this.bloomPass.radius = 0.3;
                this.bloomPass.threshold = 0.8;
                break;
            case 'rose-gold':
                this.bloomPass.strength = 0.1;
                this.bloomPass.radius = 0.3;
                this.bloomPass.threshold = 0.75;
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

    // Create chromatic aberration shader for diamond dispersion effect
    createChromaticAberrationShader() {
        return {
            uniforms: {
                tDiffuse: { value: null },
                amount: { value: 0.003 } // Chromatic aberration amount
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float amount;
                varying vec2 vUv;

                void main() {
                    vec2 offset = amount * vec2(vUv - 0.5);

                    // Sample RGB channels with slight offsets to create chromatic aberration
                    // This creates the prism-like color separation effect seen in diamonds
                    float r = texture2D(tDiffuse, vUv + offset * 1.0).r;
                    float g = texture2D(tDiffuse, vUv + offset * 0.5).g;
                    float b = texture2D(tDiffuse, vUv - offset * 0.5).b;

                    // Enhance the effect on bright areas (where diamonds sparkle)
                    vec3 color = vec3(r, g, b);
                    float brightness = dot(color, vec3(0.299, 0.587, 0.114));

                    // Apply stronger chromatic aberration on bright areas
                    float aberrationStrength = smoothstep(0.3, 1.0, brightness) * amount * 2.0;
                    vec2 brightOffset = aberrationStrength * vec2(vUv - 0.5);

                    float rBright = texture2D(tDiffuse, vUv + brightOffset * 1.2).r;
                    float gBright = texture2D(tDiffuse, vUv + brightOffset * 0.6).g;
                    float bBright = texture2D(tDiffuse, vUv - brightOffset * 0.6).b;

                    // Blend based on brightness
                    color = mix(color, vec3(rBright, gBright, bBright), brightness * 0.5);

                    gl_FragColor = vec4(color, 1.0);
                }
            `
        };
    }

    // Method to adjust chromatic aberration intensity
    setChromaticAberration(amount) {
        if (this.chromaticAberrationPass) {
            this.chromaticAberrationPass.uniforms.amount.value = amount;
        }
    }
}
