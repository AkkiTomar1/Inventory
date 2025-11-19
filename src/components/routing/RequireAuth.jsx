// src/routes/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const getRawToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  const t = token.trim();
  if (!t || t === "null" || t === "undefined") return null;

  return t;
};

export const isAuthenticated = () => {
  const token = getRawToken();
  return Boolean(token);
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
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};
