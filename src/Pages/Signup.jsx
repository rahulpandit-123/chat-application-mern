import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repassword) {
      alert("Passwords do not match");
      return;
    }

    const obj = {
      name,
      email,
      password,
    };

    try {
      await api.post("/adduser", obj);

      alert("Account created successfully");

      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error.response) {
        alert(error.response.data || "Signup failed. Please try again.");
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border-2 border-gray-300 bg-white px-5 py-8 shadow-md sm:px-8 sm:py-10"
      >
        {/* Heading */}
        <h2 className="mb-8 text-center text-3xl font-bold text-blue-600">
          Create Account
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>

          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-2.5 outline-none transition focus:border-blue-500"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded-md border border-gray-300 p-2.5 outline-none transition focus:border-blue-500"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            className="w-full rounded-md border border-gray-300 p-2.5 outline-none transition focus:border-blue-500"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>

          <input
            type="password"
            className="w-full rounded-md border border-gray-300 p-2.5 outline-none transition focus:border-blue-500"
            placeholder="Re-Enter Your Password"
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
          />
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          className="w-full rounded-md bg-black py-2.5 font-medium text-white transition hover:bg-gray-800"
        >
          Signup
        </button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;