import { useTheme } from '../hooks/useTheme';
import ThemeToggle from '../ThemeToggle';
import { useEffect, useState } from 'react';

const ThemeTest = () => {
  const { isDark } = useTheme();
  const [domClassList, setDomClassList] = useState('');

  // Monitor DOM class changes
  useEffect(() => {
    const updateClassList = () => {
      setDomClassList(document.documentElement.className);
    };
    
    updateClassList();
    
    // Create observer to watch for class changes
    const observer = new MutationObserver(updateClassList);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white transition-colors duration-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Theme Test Page</h1>
          <ThemeToggle showForAll={true} />
        </div>
        
        <div className="space-y-6">
          {/* Debug Information */}
          <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg border-2 border-red-300 dark:border-red-600">
            <h2 className="text-2xl font-semibold mb-4 text-red-800 dark:text-red-200">Debug Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>isDark from hook:</strong> {isDark.toString()}</p>
              <p><strong>localStorage theme:</strong> {localStorage.getItem('theme') || 'not set'}</p>
              <p><strong>HTML class list:</strong> {domClassList || 'empty'}</p>
              <p><strong>Dark class present:</strong> {document.documentElement.classList.contains('dark').toString()}</p>
              <p><strong>System prefers dark:</strong> {window.matchMedia('(prefers-color-scheme: dark)').matches.toString()}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Current Theme Status</h2>
            <p className="text-lg">Current theme: <span className="font-bold text-primary">{isDark ? 'Dark' : 'Light'}</span></p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This page demonstrates that the theme system is working correctly across all components.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-100 dark:bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Light Mode Card</h3>
              <p className="text-gray-700 dark:text-gray-300">This card should have light colors in light mode and dark colors in dark mode.</p>
            </div>
            
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Blue Themed Card</h3>
              <p className="text-blue-700 dark:text-blue-300">This card demonstrates color variations between themes.</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4">Form Elements Test</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Test input field" 
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <textarea 
                placeholder="Test textarea" 
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <button className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors">
                Test Button
              </button>
            </div>
          </div>
          
          {/* Manual Theme Test Buttons */}
          <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-800 dark:text-yellow-200">Manual Theme Controls</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                }}
                className="bg-white text-black px-4 py-2 rounded border"
              >
                Force Light Mode
              </button>
              <button 
                onClick={() => {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded"
              >
                Force Dark Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;