import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const DISPLAY_DISH_MODEL_PATH = './assets/models/Updated%20Rotation/Dish.glb';

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
    this.createDisplayStage();
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
      alpha: true,
      preserveDrawingBuffer: true
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better for shiny materials
    this.renderer.toneMappingExposure = 0.8; // Reduced to match lighting config and prevent overblown whites
    this.renderer.useLegacyLights = false; // Use modern lighting instead of deprecated physicallyCorrectLights
    this.renderer.setClearColor(0x000000, 0);

    this.updateSize();
  }

  createStageShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    const shadow = context.createRadialGradient(256, 256, 28, 256, 256, 238);
    shadow.addColorStop(0, 'rgba(42, 34, 25, 0.24)');
    shadow.addColorStop(0.46, 'rgba(42, 34, 25, 0.12)');
    shadow.addColorStop(0.78, 'rgba(42, 34, 25, 0.04)');
    shadow.addColorStop(1, 'rgba(42, 34, 25, 0)');
    context.fillStyle = shadow;
    context.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  createDisplayStage() {
    const dishRadius = 0.095;
    const dishTopY = 0.029;

    const dish = new THREE.Group();
    dish.name = 'marbleDisplayDish';
    dish.userData.isDisplayStage = true;
    this.scene.add(dish);

    const stageShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(dishRadius * 4.1, dishRadius * 2.9),
      new THREE.MeshBasicMaterial({
        map: this.createStageShadowTexture(),
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    );
    stageShadow.name = 'displayStageShadow';
    stageShadow.rotation.x = -Math.PI / 2;
    stageShadow.position.y = -0.003;
    stageShadow.userData.isDisplayStage = true;
    this.scene.add(stageShadow);

    this.displayStage = {
      baseRadius: dishRadius,
      currentRadius: dishRadius,
      dish,
      dishModel: null,
      stageShadow,
      dishTopY,
      pivot: new THREE.Vector3(0, dishTopY + 0.012, 0),
    };
    this.scene.userData.displayStage = this.displayStage;

    this.loadDisplayDishModel();
  }

  async loadDisplayDishModel() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    loader.setDRACOLoader(dracoLoader);

    try {
      const gltf = await loader.loadAsync(DISPLAY_DISH_MODEL_PATH);
      const dishModel = gltf.scene;
      dishModel.name = 'displayDishModel';
      dishModel.userData.isDisplayStage = true;

      this.prepareDisplayDishModel(dishModel);
      this.normalizeDisplayDishModel(dishModel);

      this.displayStage.dish.clear();
      this.displayStage.dish.add(dishModel);
      this.displayStage.dishModel = dishModel;

      this.updateDisplayStageMetrics();
      this.repositionLoadedModelOnStage();
    } catch (error) {
      console.error('Failed to load display dish model:', error);
    } finally {
      dracoLoader.dispose();
    }
  }

  prepareDisplayDishModel(dishModel) {
    dishModel.traverse((object) => {
      object.userData.isDisplayStage = true;

      if (!object.isMesh) return;

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.filter(Boolean).forEach((material) => {
        if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
        if (material.emissiveMap) material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        if (material.envMapIntensity !== undefined) {
          material.envMapIntensity = material.name?.toLowerCase().includes('velvet') ? 0.22 : 0.58;
        }
        material.needsUpdate = true;
      });
    });
  }

  normalizeDisplayDishModel(dishModel) {
    dishModel.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(dishModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    const diameter = Math.max(size.x, size.z);
    const targetDiameter = this.displayStage.baseRadius * 2;
    const scale = diameter > 0 ? targetDiameter / diameter : 1;

    dishModel.scale.setScalar(scale);
    dishModel.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(dishModel);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);

    dishModel.position.x -= center.x;
    dishModel.position.z -= center.z;
    dishModel.position.y -= scaledBox.min.y;
    dishModel.updateMatrixWorld(true);
  }

  getDishSupportTopY() {
    if (!this.displayStage?.dishModel) return this.displayStage?.dishTopY || 0;

    const supportBox = new THREE.Box3();
    let foundSupportSurface = false;

    this.displayStage.dishModel.traverse((object) => {
      if (!object.isMesh) return;

      const materialNames = (Array.isArray(object.material) ? object.material : [object.material])
        .filter(Boolean)
        .map((material) => material.name || '')
        .join(' ');
      const searchableName = `${object.name || ''} ${materialNames}`.toLowerCase();

      if (/velvet|cushion|pad|surface|petry dish\.001/.test(searchableName)) {
        supportBox.expandByObject(object);
        foundSupportSurface = true;
      }
    });

    if (foundSupportSurface) return supportBox.max.y;

    const dishBox = new THREE.Box3().setFromObject(this.displayStage.dishModel);
    return dishBox.max.y;
  }

  updateDisplayStageMetrics() {
    if (!this.displayStage) return;

    if (this.displayStage.dishModel) {
      const dishBox = new THREE.Box3().setFromObject(this.displayStage.dishModel);
      const dishSize = new THREE.Vector3();
      dishBox.getSize(dishSize);

      this.displayStage.currentRadius = Math.max(dishSize.x, dishSize.z) / 2;
      this.displayStage.dishTopY = this.getDishSupportTopY();
      this.displayStage.stageShadow.position.y = dishBox.min.y - 0.003;
    }

    this.displayStage.pivot.set(0, this.displayStage.dishTopY + 0.012, 0);
  }

  placeModelOnDisplayStage(model, contactGap = 0.0015) {
    if (!model || !this.displayStage) return;

    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.updateMatrixWorld(true);

    const settledBox = new THREE.Box3().setFromObject(model);
    model.position.y += this.displayStage.dishTopY + contactGap - settledBox.min.y;

    model.updateMatrixWorld(true);
  }

  repositionLoadedModelOnStage() {
    let loadedModel = null;
    this.scene.traverse((object) => {
      if (object.userData?.isLoadedModel) loadedModel = object;
    });

    if (!loadedModel) return;

    this.placeModelOnDisplayStage(loadedModel);
    this.updateCameraForModel(loadedModel);
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
    if (this.displayStage?.pivot) {
      this.modelCenter.copy(this.displayStage.pivot);
      return this.displayStage.pivot.clone();
    }

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
    const target = this.displayStage?.pivot?.clone() || new THREE.Vector3();
    if (!this.displayStage?.pivot) {
      boundingBox.getCenter(target);
    }
    this.modelCenter.copy(target);

    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const stageRadius = this.displayStage?.currentRadius || this.displayStage?.baseRadius || 0;
    const maxDim = Math.max(size.x, size.y, size.z, stageRadius * 2);
    const distance = Math.max(maxDim * 3.1, 0.24);

    const direction = new THREE.Vector3(0.35, 0.82, 1).normalize();
    const position = target.clone().add(direction.multiplyScalar(distance));
    
    // Update camera
    this.camera.position.copy(position);
    this.controls.target.copy(target);
    
    // Update control limits based on model size
    this.controls.minDistance = Math.max(maxDim * 0.9, 0.08);
    this.controls.maxDistance = Math.max(maxDim * 8, 0.6);

    // Look at center
    this.camera.lookAt(target);
    this.controls.update();
    
    console.log("Camera updated - Position:", this.camera.position, "Target:", this.controls.target);
}

  updateDisplayStageForModel(model) {
    if (!this.displayStage || !model) return;

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const neededRadius = Math.max(size.x, size.z) * 0.68;
    const nextRadius = Math.max(this.displayStage.baseRadius, neededRadius);
    const scale = nextRadius / this.displayStage.baseRadius;

    this.displayStage.dish.scale.set(scale, 1, scale);
    this.displayStage.stageShadow.scale.set(scale, scale, scale);
    this.updateDisplayStageMetrics();
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
