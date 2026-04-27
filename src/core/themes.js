// themes.js - Luxury theme configuration for dark and light modes

// Dark Mode: Royal Black & Gold with Ruby Accent
export const darkTheme = {
  name: 'royal',
  colors: {
    // Backgrounds
    background: {
      primary: '#0A0A0A',
      secondary: '#111111',
      tertiary: '#222222',
      highlight: '#A3273D10', // Ruby with low opacity
    },
    // Text colors
    text: {
      primary: '#F0F0F0',
      secondary: '#D4AF37', // Gold
      accent: '#A3273D', // Ruby
      muted: '#A3A3A3',
    },
    // Borders
    border: {
      primary: '#D4AF37',
      secondary: '#A3273D',
      light: '#D4AF3730', // Gold with 30% opacity
    },
    // Element colors
    elements: {
      primary: '#D4AF37', // Gold
      secondary: '#A3273D', // Ruby
      accent: '#8B0000', // Deep red
      slider: '#D4AF37',
    },
    // Gradients
    gradients: {
      gold: 'linear-gradient(90deg, #D4AF37 0%, #F7E7CE 100%)',
      goldRuby: 'linear-gradient(90deg, #D4AF37 0%, #A3273D 100%)',
      panel: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D0D 100%)',
    }
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.5)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.6)',
    large: '0 10px 15px rgba(0, 0, 0, 0.7)',
    glow: '0 0 10px rgba(212, 175, 55, 0.3)', // Gold glow
    rubyGlow: '0 0 10px rgba(163, 39, 61, 0.3)', // Ruby glow
  },
  fonts: {
    primary: "'Cormorant Garamond', Georgia, serif",
    secondary: "'Playfair Display', Georgia, serif",
    heading: "'Cormorant Garamond', Georgia, serif",
  }
};

// Light Mode: warm off-white with purple and metal accents
export const lightTheme = {
  name: 'pearl',
  colors: {
    // Backgrounds
    background: {
      primary: '#F6F0E8',
      secondary: '#FFFDF8',
      tertiary: '#F1E7DA',
      highlight: '#6D3FA014',
    },
    // Text colors
    text: {
      primary: '#302821',
      secondary: '#5E368A',
      accent: '#A77A3E',
      muted: '#766B62',
    },
    // Borders
    border: {
      primary: '#D8C7B4',
      secondary: '#6D3FA0',
      light: '#D8C7B480',
    },
    // Element colors
    elements: {
      primary: '#B48751',
      secondary: '#6D3FA0',
      accent: '#C78D84',
      slider: '#6D3FA0',
    },
    // Gradients
    gradients: {
      platinum: 'linear-gradient(90deg, #E9D9C4 0%, #FFFDF8 100%)',
      platinumPurple: 'linear-gradient(90deg, #E9D9C4 0%, #6D3FA040 100%)',
      panel: 'linear-gradient(180deg, #FFFDF8 0%, #F3E8DA 100%)',
    }
  },
  shadows: {
    small: '0 8px 22px rgba(69, 49, 29, 0.08)',
    medium: '0 16px 40px rgba(69, 49, 29, 0.13)',
    large: '0 26px 70px rgba(69, 49, 29, 0.18)',
    glow: '0 0 0 1px rgba(180, 135, 81, 0.18)',
    purpleGlow: '0 12px 28px rgba(109, 63, 160, 0.22)',
  },
  fonts: {
    primary: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }
};

// Function to get theme based on current mode
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// CSS Variables to be injected into the root element
export const generateThemeVariables = (theme) => {
  return {
    // Background colors
    '--bg-primary': theme.colors.background.primary,
    '--bg-secondary': theme.colors.background.secondary,
    '--bg-tertiary': theme.colors.background.tertiary,
    '--bg-highlight': theme.colors.background.highlight,
    
    // Text colors
    '--text-primary': theme.colors.text.primary,
    '--text-secondary': theme.colors.text.secondary,
    '--text-accent': theme.colors.text.accent,
    '--text-muted': theme.colors.text.muted,
    
    // Border colors
    '--border-primary': theme.colors.border.primary,
    '--border-secondary': theme.colors.border.secondary,
    '--border-light': theme.colors.border.light,
    
    // Element colors
    '--element-primary': theme.colors.elements.primary,
    '--element-secondary': theme.colors.elements.secondary,
    '--element-accent': theme.colors.elements.accent,
    '--element-slider': theme.colors.elements.slider,
    
    // Gradients
    '--gradient-primary': theme.colors.gradients.gold || theme.colors.gradients.platinum,
    '--gradient-secondary': theme.colors.gradients.goldRuby || theme.colors.gradients.platinumPurple,
    '--gradient-panel': theme.colors.gradients.panel,
    
    // Shadows
    '--shadow-small': theme.shadows.small,
    '--shadow-medium': theme.shadows.medium,
    '--shadow-large': theme.shadows.large,
    '--shadow-glow': theme.shadows.glow,
    '--shadow-accent-glow': theme.shadows.rubyGlow || theme.shadows.purpleGlow,
    
    // Fonts
    '--font-primary': theme.fonts.primary,
    '--font-secondary': theme.fonts.secondary,
    '--font-heading': theme.fonts.heading,
  };
};
