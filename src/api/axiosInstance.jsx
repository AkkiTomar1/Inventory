// src/api/axiosInstance.js
import axios from "axios";

const baseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL || "";

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // optionally set a timeout:
  // timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      // If unauthorized, clear session and redirect to login
      if (status === 401) {
        // prevent clearing if already on login page
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken"); // if you store refresh token
          // optionally store a message so login page can show "session expired"
          try {
            sessionStorage.setItem("authMessage", "Session expired. Please login again.");
          } catch {}
          // redirect
          window.location.href = "/login";
        }
      }
    } catch (e) {
      console.error("axios response interceptor error:", e);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
