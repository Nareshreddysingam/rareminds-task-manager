import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signup(form);
    if (res.success) navigate("/dashboard");
    else setError(res.message || "Signup failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-slate-900 dark:to-slate-950">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">Create account ✨</h1>
        <p className="text-xs text-slate-500 mb-4">
          Choose &quot;manager&quot; if you want to assign tasks to others.
        </p>

        {error && (
          <div className="mb-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Name</label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              value={form.name}
              onChange={handleChange}
            />
          </div>
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
              minLength={6}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Role</label>
            <select
              name="role"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User (work on tasks)</option>
              <option value="manager">Manager (create & assign)</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 py-2 text-sm font-medium"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
