import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    // ✅ Backend expects these fields (id optional)
    const payload = {
      username: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5173/spot_text/api/users/signup",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200 || res.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      if (err.response) {
        const msg =
          err.response.data?.message ||
          err.response.data?.error ||
          "Server returned an error.";
        setError(`Error ${err.response.status}: ${msg}`);
      } else if (err.request) {
        setError("No response from server. Check if backend is running and CORS enabled.");
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error("Signup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-amber-100 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-amber-600">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Join us and manage your business smarter
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="name"
              type="text"
              placeholder="Full name"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="email"
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Mobile */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="tel"
              type="tel"
              placeholder="Mobile number"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="new-password"
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="new-password"
              type="password"
              placeholder="Confirm password"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          {/* Messages */}
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-amber-300" : "bg-amber-500 hover:bg-amber-600"
            } text-white font-bold py-2.5 rounded-lg transition duration-300 shadow-md`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          {/* Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
