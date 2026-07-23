import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const res = await API.post("/admin", {
        username: form.username,
        password: form.password,
      });

      // save token + user data
      login(res.data);

      // redirect
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Wrong username or password"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-200
                   w-full max-w-sm p-8"
      >
        <h1 className="text-xl font-bold text-indigo-700 mb-1">
          Admin Login
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          Sign in to manage your store
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Username
            </label>

            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-indigo-300"
              placeholder="admin"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Password
            </label>

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-indigo-300"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white
                       rounded-lg py-2.5 text-sm font-medium transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
