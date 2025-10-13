import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { ReactNode } from "react";

interface AuthRouteProps {
  children: ReactNode;
  type: 'public' | 'protected';
  fallbackPath?: string;
}

export const AuthRoute = ({ 
  children, 
  type, 
  fallbackPath = "/" 
}: AuthRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const roleRoutes: Record<string, string> = {
    admin: "/admin/dashboard",
    manager: "/manager/dashboard",
    staff: "/staff/dashboard",
    shipper: "/shipper/dashboard",
    user: "/user/dashboard",
  };

  // Public route: chỉ cho phép truy cập khi CHƯA login
  if (type === 'public') {
    if (isAuthenticated && user) {
      return <Navigate to={roleRoutes[user.role] || fallbackPath} replace />;
    }
    return <>{children}</>;
  }

  // Protected route: chỉ cho phép truy cập khi ĐÃ login
  if (type === 'protected') {
    if (!isAuthenticated || !user) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <>{children}</>;
  }

  return <>{children}</>;
};