import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(loadingManager, canvas) {
    this.loadingManager = loadingManager;
    this.canvas = canvas;
    this.modelCenter = new THREE.Vector3(0, 0, 0);
    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.setupResizeHandler();
  }

  createScene() {
    this.scene = new THREE.Scene();
    
    // Add reference to this manager in scene's userData
    this.scene.userData.sceneManager = this;
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,  // Field of view - narrower for jewelry
      window.innerWidth / window.innerHeight,
      0.01,  // Near plane - closer for small objects
      1000
    );

    // Set default camera position - closer for jewelry
    this.camera.position.set(0, 5, 10);
    
    // Store initial position for reset functionality
    this.camera.userData.initialPosition = this.camera.position.clone();
    
    // Look at the center point
    this.camera.lookAt(this.modelCenter);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better for shiny materials
    this.renderer.toneMappingExposure = 0.8; // Reduced to match lighting config and prevent overblown whites
    this.renderer.useLegacyLights = false; // Use modern lighting instead of deprecated physicallyCorrectLights

    this.updateSize();
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Basic control settings
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.8;
    this.controls.panSpeed = 0.8;
    this.controls.zoomSpeed = 0.8;
    this.controls.screenSpacePanning = true;

    // Store initial target for reset functionality
    this.controls.target.copy(this.modelCenter);
    this.controls.userData = {
      initialTarget: this.modelCenter.clone()
    };

    this.setupControlLimits();
  }

  setupControlLimits() {
    if (this.controls) {
      this.controls.minDistance = 2;  // Closer min distance for jewelry
      this.controls.maxDistance = 30;  // Shorter max distance for jewelry
      this.controls.maxPolarAngle = Math.PI; // Allow full rotation for jewelry inspection
    }
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
  }

  updateSize() {
    if (!this.canvas) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const needsResize = this.canvas.width !== width || this.canvas.height !== height;

    if (needsResize) {
      this.renderer.setSize(width, height, false);
      
      if (this.camera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }

      this.renderer.shadowMap.needsUpdate = true;
    }
  }

  calculateSceneCenter() {
    const boundingBox = new THREE.Box3();
    this.scene.traverse((object) => {
      if (object.isMesh) {
        boundingBox.expandByObject(object);
      }
    });
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    this.modelCenter.copy(center);
    return center;
  }

  updateControlsTarget(target) {
    if (!target) return;
    this.modelCenter.copy(target);
    this.controls.target.copy(target);
    this.camera.lookAt(target);
    this.controls.update();
  }

  updateCameraForModel(model) {
    if (!model) return;

    console.log("Updating camera for model:", model.name || "unnamed model");

    const boundingBox = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    this.modelCenter.copy(center);

    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2.5; // Closer view for jewelry

    // Calculate new camera position
    const direction = new THREE.Vector3(0.5, 0.5, 1).normalize();
    const position = center.clone().add(direction.multiplyScalar(distance));
    
    // Update camera
    this.camera.position.copy(position);
    this.controls.target.copy(center);
    
    // Update control limits based on model size
    this.controls.minDistance = maxDim * 0.8; // Closer for jewelry
    this.controls.maxDistance = maxDim * 6;

    // Look at center
    this.camera.lookAt(center);
    this.controls.update();
    
    console.log("Camera updated - Position:", this.camera.position, "Target:", this.controls.target);
}

  getComponents() {
    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      controls: this.controls
    };
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    window.removeEventListener('resize', this.updateSize);
  }
}
