import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { isUserLoggedIn } from "./authUtils";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // ✅ useEffect always runs
  useEffect(() => {
    const loggedIn = isUserLoggedIn();
    setIsLoggedIn(loggedIn);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const loggedInMenuItems = [
    { name: "Home", path: "/" },
    { name: "Prediction", path: "/prediction" },
    { name: "History", path: "/history" },
    { name: "Profile", path: "/profile" },
    { name: "About", path: "/about" },        // <-- Add this
    { name: "Contact", path: "/contact" },    // <-- Add this
  ];

  const publicMenuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const menuItems = isLoggedIn ? loggedInMenuItems : publicMenuItems;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg sticky top-0 z-50 text-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className=" font-bold tracking-wide">
            Sleep Time Prediction System
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {/* Show different menu items based on login status */}
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`hover:text-yellow-400 transition duration-200 font-medium ${
                    isActive ? "text-yellow-400 border-b-2 border-yellow-400" : ""
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Right corner */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <ThemeToggle />
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 dark:bg-gray-200 dark:text-gray-800 px-4 py-1 rounded font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-300 transition-colors duration-200"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 dark:bg-gray-200 dark:text-gray-800 px-4 py-1 rounded font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-300 transition-colors duration-200"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-blue-700 dark:bg-gray-800 px-4 pb-4 transition-colors duration-300">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 text-sm hover:text-yellow-400 ${
                  isActive ? "text-yellow-400 font-semibold" : ""
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="mt-2 text-center">
            {isLoggedIn ? (
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex flex-col space-y-2 items-center">
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block py-2 px-4 bg-white text-blue-700 dark:bg-gray-200 dark:text-gray-800 font-semibold rounded w-full max-w-xs hover:bg-yellow-200 dark:hover:bg-yellow-300 transition-colors duration-200"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block py-2 px-4 bg-white text-blue-700 dark:bg-gray-200 dark:text-gray-800 font-semibold rounded w-full max-w-xs hover:bg-yellow-200 dark:hover:bg-yellow-300 transition-colors duration-200"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
