import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./nav";
import Footer from "./Footer";
import Sidebar from "./pages/AdminPages/SideBar";
import AdminRoutes from "./pages/AdminRoutes";
import ClientRoutes from "./pages/ClientRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

// Global theme initialization
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const AppWithRouter = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Initialize theme on app load
  useEffect(() => {
    initializeTheme();
  }, []);

  const isAdminPath = pathname.startsWith("/admin");

  // Define paths that should hide Navbar and Footer
  const noLayoutPaths = [
    "/login",
    "/register",
    "/OTPVerify",
    "/request-reset",
    "/verify-otp",
    "/reset-password",
  ];

  const hideLayout = noLayoutPaths.includes(pathname);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white flex">
      {isAdminPath && <Sidebar />}

      <div className="flex-1">
        {/* Show Navbar only if not in admin and not in auth pages */}
        {!isAdminPath && !hideLayout && <Navbar />}

        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<ClientRoutes />} />
        </Routes>

        {/* Show Footer only if not in admin and not in auth pages */}
        {!isAdminPath && !hideLayout && <Footer />}
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <AppWithRouter />
    </Router>
  );
}

export default App;
