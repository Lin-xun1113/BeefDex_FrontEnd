import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-track">
        <span className="theme-icon sun-icon">☀️</span>
        <span className="theme-icon moon-icon">🌙</span>
        <div className={`theme-toggle-thumb ${theme}`}></div>
      </div>
    </button>
  );
};

export default ThemeToggle;
