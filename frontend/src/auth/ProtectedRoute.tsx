import { Navigate, Outlet } from "react-router";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

