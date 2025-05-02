import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: isDarkMode 
          ? 'rgba(212, 175, 55, 0.1)' 
          : 'rgba(75, 0, 130, 0.08)',
        color: isDarkMode ? '#D4AF37' : '#4B0082',
        border: `1px solid ${isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(75, 0, 130, 0.2)'}`,
      }}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
