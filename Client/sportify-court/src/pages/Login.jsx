import { useEffect, useState } from "react";
import { api } from "../helpers/http-client";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { SuccessAlert, ErrorAlert } from "../helpers/alert";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      // console.log("🚀 ~ response:", response);
      const access_token = response.data?.access_token;
      const role = response.data?.user?.role;
      const name = response.data?.user?.name;
      if (!access_token) {
        throw new Error("Token tidak ditemukan. Cek struktur response.");
      }
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      SuccessAlert("Login successful!");
      if (role === "admin") {
        navigate("/admin/bookings");
      } else {
        navigate("/public/courts");
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Login Failed");
    }
  };

  async function handleCredentialResponse(response) {
    // console.log("Encoded JWT ID token: " + response.credential);
    try {
      const res = await api.post("/auth/login/google", {
        id_token: response.credential,
      });
      // console.log("🚀 ~ Google Login Response:", res);
      const access_token = res.data?.access_token;
      const role = res.data?.user?.role;
      const name = res.data?.user?.name;
      if (!access_token) {
        throw new Error("Token tidak ditemukan. Cek struktur response.");
      }
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      // console.log("🚀 ~ Google Login Role:", role);
      localStorage.getItem("name");
      // console.log("🚀 ~ handleCredentialResponse ~ name:", nameUser);
      // localStorage.setItem("name", response.data?.user?.name);
      if (role === "admin") {
        navigate("/admin/bookings");
      } else {
        navigate("/public/courts");
      }
      SuccessAlert("Google Login successful!");
    } catch (err) {
      console.error("❌ Google Login Error:", err);
      const errors =
        err.response?.data?.message || err.message || "Something went wrong!";
      ErrorAlert(errors, "Google Login Failed");
    }
  }
  useEffect(() => {
    console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" } // customization attributes
    );
    // google.accounts.id.prompt(); // also display the One Tap dialog
  }, []);

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
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <div id="buttonDiv" className="relative inline-block"></div>
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link to="/auth/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
