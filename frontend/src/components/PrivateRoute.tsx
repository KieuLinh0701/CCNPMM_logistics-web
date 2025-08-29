import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import Forbidden from "../pages/Forbidden";

export const PrivateRoute = ({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: string[];
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  if (roles && !roles.includes(user.role)) return <Forbidden />;

  return children;
};
