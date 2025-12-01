import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !allowedRoles.includes(user.role)) {
    // Not logged in OR role not allowed → redirect to Home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
