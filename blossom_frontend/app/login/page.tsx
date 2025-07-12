"use client";
import React, { useState } from "react";
import Link from "next/link";

// Login page component
export default function LoginPage() {
  // State to store form values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    // TODO: Add API call for login here
    alert(`Welcome back, ${username}! (API integration coming soon)`);
  };

  // Handle close button click (for now, just log to console)
  const handleClose = () => {
    console.log("Close button clicked");
    // In a real modal, you would close the modal here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      {/* Modal container with extra top padding to avoid overlap */}
      <div className="relative w-full max-w-md bg-black bg-opacity-80 rounded-2xl shadow-2xl p-8 pt-16 border border-pink-400">
        {/* Close (X) button in top-right, absolutely positioned */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-pink-300 hover:text-pink-500 text-2xl font-bold focus:outline-none transition-colors z-10"
          aria-label="Close login form"
        >
          &times;
        </button>
        {/* Heading with blossom icon and gradient text, always centered */}
        <div className="flex flex-col items-center justify-center mb-2 mt-0">
          <span className="text-3xl mb-1"></span>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent tracking-wide text-center">
            WELCOME BACK
          </h1>
        </div>
        <p className="text-center text-gray-200 mb-6 text-sm">Sign in to sync your progress across devices!</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-pink-400 bg-black bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-pink-200"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-pink-400 bg-black bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-pink-200"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 text-white font-bold py-2 rounded-lg shadow-md transition-colors text-lg mt-2"
          >
            <span role="img" aria-label="rocket">🚀</span> SIGN IN
          </button>
        </form>
        <p className="mt-6 text-center text-gray-300 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-300 hover:underline font-semibold">Create Account</Link>
        </p>
        <p className="mt-2 text-center text-gray-400 text-xs">
          Skip for now (Continue as guest)
        </p>
      </div>
    </div>
  );
} 