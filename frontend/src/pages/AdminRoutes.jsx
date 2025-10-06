// routes/AdminRoutes.jsx
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

import AdminDashboard from "../pages/AdminPages/adminDash";
import AllUsers from "../pages/AdminPages/AllUsers";
import AddUser from "./AdminPages/AddUser";
import AdminProfile from "./AdminPages/adminProfile";

import DashboardDescription from "./AdminPages/DashboardDescription";
import DatasetVisualizer from "./AdminPages/DatasetChart";
import SystemChart from "./AdminPages/systemChart";
import AdminSystemReport from "./AdminPages/SystemReport";
import ModelPerformance from "./AdminPages/ModelPerformance";
// import ReportAdvancedView from "./AdminPages/SystemReport";

const AdminRoutes = () => {
  return (

    <Routes>
      {/* <Sidebar /> */}
      <Route
        path="/admindash"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewusers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AllUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adduser"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dataset-chart"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DatasetVisualizer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-chart"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SystemChart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/description"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardDescription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSystemReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/model-performance"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ModelPerformance />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
