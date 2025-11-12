import { useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const tokenType = localStorage.getItem("tokenType") || "Bearer";

      if (token) {
        await axios.post(
          "/api/admin/logout",
          {},
          {
            headers: {
              Authorization: `${tokenType} ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 5000,
          }
        );
      }
    } catch (err) {
      console.warn("Logout API error:", err?.response?.data || err.message);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return logout;
};

export default useLogout;
