import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export const RedirectIfAuth = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
