import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // from .env
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to each request automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
