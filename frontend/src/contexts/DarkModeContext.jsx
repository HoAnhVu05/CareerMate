import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load from localStorage or default to false
    try {
      const saved = localStorage.getItem('darkMode');
      const isDark = saved ? JSON.parse(saved) : false;
      // Apply immediately on initialization
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return isDark;
    } catch (e) {
      console.error('Error loading dark mode:', e);
      return false;
    }
  });

  useEffect(() => {
    // Apply dark mode class to document root immediately
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      console.log('Dark mode ON - class added to <html>');
    } else {
      root.classList.remove('dark');
      console.log('Dark mode OFF - class removed from <html>');
    }
    
    // Save to localStorage whenever it changes
    try {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    } catch (e) {
      console.error('Error saving dark mode:', e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('toggleDarkMode called, current state:', isDarkMode);
    setIsDarkMode(prev => {
      const newValue = !prev;
      console.log('Setting dark mode to:', newValue);
      
      // Immediately apply the class for instant feedback
      const root = document.documentElement;
      if (newValue) {
        root.classList.add('dark');
        console.log('Added dark class to <html> element');
      } else {
        root.classList.remove('dark');
        console.log('Removed dark class from <html> element');
      }
      
      // Verify the class was added/removed
      console.log('Current classes on <html>:', root.className);
      
      return newValue;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}
