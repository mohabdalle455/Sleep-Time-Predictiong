// routes/ClientRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

import WelcomePage from "../pages/clientPages/HomePage";
import About from "../pages/clientPages/About";
import Contact from "../pages/clientPages/Contact";
import PredictionForm from "../pages/clientPages/prediction";
import Profile from "../pages/clientPages/Profile";
import Recommendation from "../pages/clientPages/recommandation";
import AuthTest from "../components/AuthTest";

import Login from "../auth/Login";
import Register from "../auth/Register";
import VerifyAccountOTP from "../auth/VerifyAccountOTP";
import RequestReset from "../auth/RequestReset";
import ResetPassword from "../auth/ResetPassword";
import VerifyResetOTP from "../auth/VerifyResetOTP";
import HistoryPage from "./clientPages/HistoryPage";
import ThemeTest from "./ThemeTest";

const ClientRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/OTPVerify" element={<VerifyAccountOTP />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/verify-otp" element={<VerifyResetOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/theme-test" element={<ThemeTest />} />

      {/* Protected */}
      <Route
        path="/prediction"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <PredictionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth-test"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <AuthTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendation/:id"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <Recommendation />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default ClientRoutes;
