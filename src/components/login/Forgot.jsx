import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const Forgot = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ email });
    else console.log("Forgot password payload:", { email });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-amber-100 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-extrabold text-amber-600 mb-3">
          Forgot Password
        </h1>
        <p className="text-gray-500 mb-6">
          Enter your email and we'll send a link to reset your password.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-semibold">
              ✅ Reset link sent successfully!
            </p>
            <Link
              to="/login"
              className="block mt-4 text-amber-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition duration-300 shadow-md"
            >
              Send Reset Link
            </button>

            <p className="text-gray-600 text-sm">
              Remembered your password?{" "}
              <Link to="/login" className="text-amber-600 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgot;
