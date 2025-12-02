import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password);
    if (res.success) navigate("/dashboard");
    else setError(res.message || "Login failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-slate-900 dark:to-slate-950">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">Welcome back 👋</h1>
        <p className="text-xs text-slate-500 mb-4">
          Login to your Collaborative Task Manager account.
        </p>

        {error && (
          <div className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 py-2 text-sm font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-sky-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
