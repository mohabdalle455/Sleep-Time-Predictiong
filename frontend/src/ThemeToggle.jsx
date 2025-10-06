import { isUserLoggedIn } from "./authUtils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./hooks/useTheme";

const ThemeToggle = ({ showForAll = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const loggedIn = isUserLoggedIn();

  // Show theme toggle for logged-in users or when showForAll is true
  if (!loggedIn && !showForAll) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-gray-600 transition-colors duration-300"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="text-yellow-400 w-6 h-6" />
      ) : (
        <Moon className="text-gray-800 dark:text-white w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;