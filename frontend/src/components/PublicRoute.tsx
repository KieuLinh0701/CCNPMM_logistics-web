import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const roleRoutes: Record<string, string> = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      staff: "/staff/dashboard",
      shipper: "/shipper/dashboard",
      user: "/user/dashboard",
    };
    return <Navigate to={roleRoutes[user.role] || "/"} replace />;
  }

  return <>{children}</>;
};