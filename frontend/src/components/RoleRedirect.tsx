import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux"; // hook custom useSelector

export const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Nếu chưa login -> quay về trang chủ
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  // Map role -> route
  const roleRoutes: Record<string, string> = {
    admin: "/admin/dashboard",
    manager: "/manager/dashboard",
    staff: "/staff/dashboard",
    shipper: "/shipper/dashboard",
    user: "/user/dashboard",
  };

  // Điều hướng theo role, nếu role không hợp lệ -> "/"
  return <Navigate to={roleRoutes[user.role] || "/"} replace />;
};