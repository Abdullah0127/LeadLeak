import { Navigate, Outlet } from "react-router-dom";

// ========================================
// PROTECTED ROUTE
// ========================================

function ProtectedRoute() {
  const token = localStorage.getItem("auth-token");

  // REDIRECT IF USER IS NOT LOGGED IN
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
