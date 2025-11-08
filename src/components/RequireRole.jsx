import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./loading_spins/LoadingSpinner";

export default function RequireRole({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner/>
      </div>
    );
  }

  const role = String(user?.role || "").toUpperCase();

  if (!role) {
    // chưa login → về login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu không nằm trong allowedRoles → redirect về trang chủ role của họ
  if (!allowedRoles.includes(role)) {
    const redirectMap = {
      ADMIN: "/admin",
      STAFF: "/staff",
      DRIVER: "/driver",
    };
    const redirectPath = redirectMap[role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
