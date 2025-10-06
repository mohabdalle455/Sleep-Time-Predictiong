import { useState, useEffect } from 'react';

// Simple theme management
export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    // Apply theme to DOM immediately
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return shouldBeDark;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Update DOM immediately
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Force a re-render by dispatching a storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: newTheme ? 'dark' : 'light',
      storageArea: localStorage
    }));
  };

  // Listen for storage changes (theme changes from other tabs/components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue === 'dark';
        setIsDark(newTheme);
        
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isDark, toggleTheme };
};