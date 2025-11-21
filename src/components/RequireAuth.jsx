import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("authToken");

  if (token) {
    return <Outlet />;
  }
  return <Navigate to="/" state={{ from: location }} replace />;
}
