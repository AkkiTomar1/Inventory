// src/routes/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Safely retrieve token from localStorage and treat "null"/"undefined"/"" as absent.
 */
const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    return null;
  }
  return token;
};

/**
 * Try to decode JWT and check exp claim (seconds since epoch).
 * Returns true if token is valid (not expired) OR token isn't a JWT but is present.
 */
const isTokenValid = (token) => {
  if (!token) return false;

  // Quick check for JWT structure: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) {
    // Not a JWT — assume presence means valid (server will reject if not).
    return true;
  }

  try {
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decodeURIComponent(escape(payloadJson))); // robust decoding
    const exp = payload.exp;
    if (!exp) return true; // no exp claim, assume valid
    const now = Math.floor(Date.now() / 1000);
    if (now >= Number(exp)) {
      // expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return false;
    }
    return true;
  } catch (err) {
    // If parsing fails, assume token valid and let server decide (but you may clear it)
    console.warn("Failed to parse token payload:", err);
    return true;
  }
};

export const isAuthenticated = () => {
  const token = getStoredToken();
  return Boolean(token) && isTokenValid(token);
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
