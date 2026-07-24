import { useState } from "react";
import { api } from "../helpers/http-client";
import { Link, useNavigate } from "react-router";
import { ErrorAlert, SuccessAlert } from "../helpers/alert";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log("Register Payload:", { name, email, password });
      await api.post("auth/register", {
        name,
        email,
        password,
      });
      SuccessAlert("Registration successful!");
      navigate("/auth/login");
    } catch (err) {
      console.error("Register Error:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Register Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img
            src="/Sportify-Courts.png"
            alt="Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-sm text-gray-500">
            Create your account to start booking courts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition duration-150"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
