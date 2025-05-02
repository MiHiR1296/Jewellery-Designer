// Utility functions for path handling

/**
 * Gets the base URL for assets
 * Handles development vs. production environments
 */
export const getBaseUrl = () => {
    // Use import.meta.env.BASE_URL if available (Vite)
    const baseUrl = import.meta.env?.BASE_URL || './';
    return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  };
  
  /**
   * Gets a full path to a model asset
   * @param {string} modelPath - Relative path to model
   * @returns {string} Full path to model
   */
  export const getModelPath = (modelPath) => {
    const baseUrl = getBaseUrl();
    const cleanPath = modelPath.startsWith('/') ? modelPath.slice(1) : modelPath;
    return `${baseUrl}assets/models/${cleanPath}`;
  };
  
  /**
   * Gets a full path to a texture asset
   * @param {string} texturePath - Relative path to texture
   * @returns {string} Full path to texture
   */
  export const getTexturePath = (texturePath) => {
    const baseUrl = getBaseUrl();
    const cleanPath = texturePath.startsWith('/') ? texturePath.slice(1) : texturePath;
    return `${baseUrl}assets/textures/${cleanPath}`;
  };
  
  /**
   * Gets a full path to an HDRI asset
   * @param {string} hdriPath - Relative path to HDRI
   * @returns {string} Full path to HDRI
   */
  export const getHdriPath = (hdriPath) => {
    const baseUrl = getBaseUrl();
    const cleanPath = hdriPath.startsWith('/') ? hdriPath.slice(1) : hdriPath;
    return `${baseUrl}assets/hdri/${cleanPath}`;
  };
  
  /**
   * Converts various path formats to a standard format
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path
   */
  export const normalizePath = (path) => {
    if (!path) return '';
    
    // Remove multiple consecutive slashes
    let normalized = path.replace(/\/+/g, '/');
    
    // Remove leading slash
    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }
    
    return normalized;
  };