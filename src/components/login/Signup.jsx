import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirm: "" });
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
    const payload = { email: form.email.trim(), phoneNumber: form.mobile.trim(), name: form.name.trim(), password: form.password };
    try {
      setLoading(true);
      const res = await axios.post("/api/admin/register", payload, { headers: { "Content-Type": "application/json" } });
      if (res.status === 200 || res.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1400);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error || "Server returned an error.";
        setError(`Error ${err.response.status}: ${msg}`);
      } else if (err.request) {
        setError("No response from server. Check backend and CORS.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-linear-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
          <FaUser className="text-white text-2xl" />
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-3xl font-extrabold text-amber-700">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join us and manage your business smarter</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="name"
              type="text"
              placeholder="Full name"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="email"
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="tel"
              type="tel"
              placeholder="Mobile number"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="new-password"
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              autoComplete="new-password"
              type="password"
              placeholder="Confirm password"
              className="w-full pl-10 pr-3 py-2.5 bg-amber-50/40 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-gray-700"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-center text-sm text-red-600 font-medium">{error}</p>}
          {success && <p className="text-center text-sm text-green-600 font-medium">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-amber-300" : "bg-amber-500 hover:bg-amber-600"} text-white font-bold py-2.5 rounded-xl shadow-lg transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

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
