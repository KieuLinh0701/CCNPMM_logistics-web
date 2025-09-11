import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import Forbidden from "../pages/Forbidden";
import { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Forbidden />;
  }

  return <>{children}</>;
};