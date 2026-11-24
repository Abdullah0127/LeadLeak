import { Routes, Route } from "react-router-dom";

// PUBLIC PAGES
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Alerts from "../pages/Alerts";

// PRIVATE AREA PAGES
import Dashboard from "../pages/Dashboard";
import WorkspaceSetup from "../pages/WorkspaceSetup";
import AdminLogin from "../pages/AdminLogin";
import Websites from "../pages/Websites";
import WebsiteDetails from "../pages/WebsiteDetails";
import Analytics from "../pages/Analytics";

// LAYOUTS
import PublicLayout from "../components/layout/PublicLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* PROTECTED CUSTOMER ROUTES */}
      <Route element={<ProtectedRoute />}>
        {/* Workspace Setup */}
        <Route path="/workspace/setup" element={<WorkspaceSetup />} />

        {/* SHARED DASHBOARD LAYOUT */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/websites/:id" element={<WebsiteDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Route>

      {/* ADMIN LOGIN */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* 404 PAGE */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-bold text-brand-700">
              404 - Page Not Found
            </h1>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
