import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const roleRoutes: Record<string, string> = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      staff: "/staff/dashboard",
    };
    return <Navigate to={roleRoutes[user.role] || "/"} replace />;
  }

  return children;
};