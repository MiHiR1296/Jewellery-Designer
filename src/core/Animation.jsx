import * as THREE from 'three';

// Set up key state tracking
const keys = {};
let keysPressedThisFrame = {};
let keysProcessed = {};

// Add keyboard event listeners
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = true;
    keysPressedThisFrame[key] = true;
    
    // Prevent default for camera control keys to avoid conflicts
    if (['w', 'a', 's', 'd', 'q', 'e', 'f', 'r', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    keys[key] = false;
    delete keysPressedThisFrame[key];
    delete keysProcessed[key];
});

export function animate(renderer, scene, camera, controls, modelControls) {
    const clock = new THREE.Clock();
    const moveSpeed = 0.02; // Reduced from 0.1 for much slower, more controlled movement
    const rotateSpeed = 0.005; // Reduced from 0.01 for slower rotation
    let animationsPlaying = true;

    function resetCamera() {
        if (scene.userData.sceneManager) {
            console.log("Resetting camera...");
            
            // Get all models with isLoadedModel flag
            const loadedModels = [];
            scene.traverse((object) => {
                if (object.userData?.isLoadedModel) {
                    loadedModels.push(object);
                }
            });
            
            console.log(`Found ${loadedModels.length} loaded models`);
            
            // If multiple models found, only use the most recently added one
            const loadedModel = loadedModels.length > 0 ? loadedModels[loadedModels.length - 1] : null;
            
            if (loadedModel) {
                scene.userData.sceneManager.updateCameraForModel(loadedModel);
                console.log("Camera reset to focus on model:", loadedModel.name || "unnamed model");
                
                // Also reset any environment rotation
                if (scene.userData.lightingSystem) {
                    scene.userData.lightingSystem.rotateEnvironment(0);
                }
            } else {
                console.warn("No model with isLoadedModel found");
            }
        }
    }

    function animationLoop() {
        // Check if animation should be stopped
        if (window.stopAnimation) {
            console.log("Animation loop stopped");
            window.stopAnimation = false; // Reset for next time
            return;
        }
        
        requestAnimationFrame(animationLoop);
        const delta = clock.getDelta();

        // Update mixers only if animations are playing
        if (animationsPlaying && modelControls) {
            const mixers = modelControls.getCurrentMixers();
            mixers.forEach(mixer => {
                if (mixer) mixer.update(delta);
            });
        }

        // Process single-press keys (like F and R)
        // Use a copy of keysPressedThisFrame to avoid iteration issues
        const keysToProcess = Object.keys(keysPressedThisFrame);
        keysToProcess.forEach(key => {
            if (!keysProcessed[key]) {
                // Reset camera (F)
                if (key === 'f') {
                    resetCamera();
                    keysProcessed[key] = true;
                }
                
                // Auto-rotation toggle (R)
                if (key === 'r') {
                    if (controls) {
                        controls.autoRotate = !controls.autoRotate;
                        controls.autoRotateSpeed = 0.5; // Reduced from 2.0 for slower, more elegant rotation
                        console.log("Auto-rotation toggled via R key:", controls.autoRotate, "Speed:", controls.autoRotateSpeed);
                        keysProcessed[key] = true;
                    } else {
                        console.warn("Controls not available for R key toggle");
                    }
                }
            }
        });

        // Camera movement
        if (keys) {
            const modelCenter = scene.userData.sceneManager ? 
                              scene.userData.sceneManager.calculateSceneCenter() : 
                              new THREE.Vector3();

            // Get the direction to the target (model center)
            const direction = new THREE.Vector3();
            direction.subVectors(controls.target, camera.position).normalize();

            // Get the right vector (perpendicular to direction)
            const right = new THREE.Vector3();
            right.crossVectors(camera.up, direction).normalize();

            // Forward/Backward movement (W/S or Arrow Up/Down)
            if (keys['w'] || keys['arrowup']) {
                const moveVector = direction.clone().multiplyScalar(moveSpeed);
                camera.position.add(moveVector);
            }
            if (keys['s'] || keys['arrowdown']) {
                const moveVector = direction.clone().multiplyScalar(-moveSpeed);
                camera.position.add(moveVector);
            }

            // Rotation (A/D or Arrow Left/Right)
            if (keys['d'] || keys['arrowright']) {
                const angle = rotateSpeed;
                const currentPosition = camera.position.clone().sub(modelCenter);
                currentPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                camera.position.copy(currentPosition.add(modelCenter));
            }
            if (keys['a'] || keys['arrowleft']) {
                const angle = -rotateSpeed;
                const currentPosition = camera.position.clone().sub(modelCenter);
                currentPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                camera.position.copy(currentPosition.add(modelCenter));
            }

            // Up/Down movement (Q/E)
            if (keys['q']) {
                camera.position.y += moveSpeed;
                controls.target.y += moveSpeed;
            }
            if (keys['e']) {
                camera.position.y -= moveSpeed;
                controls.target.y -= moveSpeed;
            }

            // Keep the camera looking at the target
            camera.lookAt(controls.target);
        }

        // Update controls
        controls.update();

        // Update helpers if they exist
        scene.traverse((object) => {
            if (object.isHelper) {
                object.update();
            }
        });

        // Render the scene
        if (renderer.composer) {
            renderer.composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    // Initialize auto-rotate for jewelry display
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // Slow, elegant rotation (reduced from higher values)

    // Start the animation loop
    window.stopAnimation = false; // Reset any existing stop flag
    animationLoop();
}