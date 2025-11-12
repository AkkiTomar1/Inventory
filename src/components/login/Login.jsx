import React, { useState } from "react";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/admin/login", {
        email: form.email,
        password: form.password,
      });

      const { tokenType, accessToken } = res.data;

      if (accessToken) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("tokenType", tokenType);
        localStorage.setItem("accessToken", accessToken);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Server error");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
          <FaUserAlt className="text-white text-2xl" />
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-extrabold text-amber-700">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to manage your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3.5 text-gray-500"
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <p className="text-center text-red-600 font-medium text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-white font-bold py-2.5 rounded-xl shadow-lg hover:shadow-amber-300/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="flex justify-between items-center text-sm mt-2">
            <Link to="/signup" className="text-amber-600 hover:underline">
              Create Account
            </Link>
            <Link to="/forgot" className="text-amber-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
