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
      const res = await axios.get("/spot_text/api/users");
      const users = res.data;

      // Validate user by email + password
      const matchedUser = users.find(
        (user) =>
          user.email.trim().toLowerCase() === form.email.trim().toLowerCase() &&
          user.password === form.password
      );

      if (matchedUser) {
        console.log("✅ Login successful:", matchedUser);

        // Save login flag & user data to localStorage
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(matchedUser));

        // Navigate to dashboard inside protected layout
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-amber-100 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-amber-600">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sign in to manage your inventory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3.5 text-gray-500 focus:outline-none"
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-600 font-semibold">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition duration-300 shadow-md ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="flex justify-between items-center text-sm mt-2">
            <Link to="/signup" className="text-amber-600 hover:underline">
              Create account
            </Link>
            <Link to="/forgot" className="text-amber-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
