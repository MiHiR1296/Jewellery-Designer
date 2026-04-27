function findAllPartsByName(partName) {
  if (!window.scene) {
    console.warn('Scene not available');
    return [];
  }

  const foundObjects = [];
  const partNameLower = partName.toLowerCase();

  window.scene.traverse((object) => {
    if (!object.isMesh) return;

    const objectName = object.name ? object.name.toLowerCase() : '';
    const userDataPartName = object.userData?.partName
      ? object.userData.partName.toLowerCase()
      : '';

    if (
      objectName === partNameLower ||
      userDataPartName === partNameLower ||
      objectName.includes(partNameLower) ||
      userDataPartName.includes(partNameLower)
    ) {
      foundObjects.push(object);
    }
  });

  return foundObjects;
}

function getAllPartNames() {
  if (!window.scene) return [];

  const partNames = new Set();
  window.scene.traverse((object) => {
    if (!object.isMesh) return;
    if (object.name) partNames.add(object.name);
    if (object.userData?.partName) partNames.add(object.userData.partName);
  });

  return Array.from(partNames);
}

export function applyJewelleryStyle(app, style) {
  if (!app?.materialManager || !style) return false;

  try {
    const materialManager = app.materialManager;

    if (style.finish) {
      app.updateFinish(style.finish);
    }

    Object.entries(style.materials).forEach(([partName, materialType]) => {
      const partObjects = findAllPartsByName(partName);

      if (!partObjects.length) {
        console.warn(
          `No parts found for: ${partName}. Available parts:`,
          getAllPartNames(),
        );
        return;
      }

      const isMetal =
        materialManager.METAL_PRESETS &&
        materialType in materialManager.METAL_PRESETS;
      const isGem =
        materialManager.GEM_PRESETS && materialType in materialManager.GEM_PRESETS;

      if (isMetal) {
        const finish = style.finish || 'polished';
        const material = materialManager.createMetalMaterial(materialType, finish);

        partObjects.forEach((object) => {
          if (object.material) object.material.dispose();
          object.material = material.clone();
          object.material.needsUpdate = true;
        });
      } else if (isGem) {
        const material = materialManager.createGemMaterial(materialType);

        partObjects.forEach((object) => {
          if (object.material) object.material.dispose();
          object.material = material.clone();
          object.material.needsUpdate = true;
        });
      } else {
        console.warn(`Unknown material type: ${materialType}`);
      }
    });

    return true;
  } catch (error) {
    console.error('Error applying style:', error);
    return false;
  }
}
