import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handlelogin() {
    const obj = { email, password };

    try {
      const res = await api.post("/login", obj);

      localStorage.setItem("token", res.data);

      navigate("/chat");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-200 px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border-2 border-gray-300 bg-white px-5 py-10 shadow-md sm:px-8">

        <h2 className="mb-8 text-3xl font-bold text-blue-600">
          Login
        </h2>

        <div className="w-full">
          <input
            className="mb-4 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-blue-500"
            type="email"
            placeholder="Please Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="mb-4 w-full rounded-md border border-gray-300 p-2.5 outline-none focus:border-blue-500"
            type="password"
            placeholder="Please Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            onClick={handlelogin}
            className="mb-6 w-full rounded-md bg-black py-2.5 text-white transition hover:bg-gray-800"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

