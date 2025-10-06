import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // If user is admin but trying to access non-admin routes, allow it
        if (role === "admin" && !allowedRoles.includes("admin")) {
            return children;
        }
        // If user is not admin and trying to access admin routes, redirect to home
        return <Navigate to="/" replace />;
    }

    // If user is admin, allow access to admin routes
    if (role === "admin" && allowedRoles?.includes("admin")) {
        return children;
    }

    return children;
};

export default ProtectedRoute;
