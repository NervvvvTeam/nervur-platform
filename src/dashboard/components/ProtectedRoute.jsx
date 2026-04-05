import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f0f11" }}>
        <div style={{ fontSize: "13px", letterSpacing: "3px", color: "#86868B", textTransform: "uppercase" }}>Chargement...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/app/login" replace />;
}
