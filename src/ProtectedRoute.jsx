import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && (!role || !roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}