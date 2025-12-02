import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");
    setCreating(true);
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-xs text-slate-500">
            Manage and track Rareminds client and internal projects.
          </p>
        </div>
      </div>

      {/* Manager: Create Project */}
      {user.role === "manager" && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold mb-2">Create new project</h2>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <form onSubmit={createProject} className="grid md:grid-cols-3 gap-3 text-xs">
            {/* Project Name */}
            <div className="md:col-span-1">
              <label className="font-medium">Project name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
                placeholder="E.g. Rareminds Batch Hiring"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="font-medium">Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
                placeholder="Short description"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-3 flex justify-end">
              <button
                disabled={creating}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-medium"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Project List */}
      <section className="grid md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p._id} className="card p-4 text-xs space-y-1">
            <h3 className="text-sm font-semibold">{p.name}</h3>
            {p.description && (
              <p className="text-slate-500 dark:text-slate-400">
                {p.description}
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Owner: {p.owner?.name || "—"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Status: {p.status}
            </p>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-xs text-slate-500">
            No projects created yet.
          </p>
        )}
      </section>
    </div>
  );
}
