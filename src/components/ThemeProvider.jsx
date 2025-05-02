import React, { createContext, useState, useEffect, useContext } from 'react';
import { getTheme, generateThemeVariables } from '../core/themes';

// Create a context for theme management
export const ThemeContext = createContext({
  isDarkMode: true,
  toggleTheme: () => {},
  theme: {}
});

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component to wrap around the app
export const ThemeProvider = ({ children }) => {
  // Check for user's saved preference or use system preference
  const getInitialMode = () => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialMode);
  const [theme, setTheme] = useState(getTheme(isDarkMode));

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Update theme when mode changes
  useEffect(() => {
    const newTheme = getTheme(isDarkMode);
    setTheme(newTheme);
    
    // Save preference to localStorage
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
    
    // Apply CSS variables to document root
    const variables = generateThemeVariables(newTheme);
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Update body class for global styling
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
