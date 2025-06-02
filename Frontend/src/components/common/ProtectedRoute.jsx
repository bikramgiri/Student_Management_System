import React, { useEffect, useState, memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = memo(({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute useEffect - token:', token);
    if (token !== null) {
      setIsLoading(false);
    }
  }, [token]);

  console.log('ProtectedRoute rendered - isLoading:', isLoading, 'user:', user?.role);

  if (isLoading) return <div>Loading...</div>;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return React.cloneElement(children, { key: children.props.key }); // Preserve key
});

export default ProtectedRoute;