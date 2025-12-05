import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const isManager = user?.role === "manager";

  const loadProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setProjects([]);
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

  const moveToTrash = async (id) => {
    if (!window.confirm("Move this project to Trash?")) return;
    try {
      await api.put(`/projects/${id}/trash`);
      await loadProjects();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-lg font-semibold">Projects</h1>

      {isManager && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold mb-2">Create new project</h2>
          {error && <p className="text-xs text-red-500">{error}</p>}

          <form
            onSubmit={createProject}
            className="grid md:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <label className="font-medium">Project name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2 text-xs"
                placeholder="E.g. Rareminds Hiring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium">Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2 text-xs"
                placeholder="Short description"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                disabled={creating}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-xs"
              >
                {creating ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </section>
      )}

      {actionError && (
        <p className="text-xs text-red-500">{actionError}</p>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p._id} className="card p-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold">{p.name}</h3>
                {p.description && (
                  <p className="text-slate-500">{p.description}</p>
                )}
              </div>

              {isManager && (
                <button
                  onClick={() => moveToTrash(p._id)}
                  className="text-[11px] px-2 py-1 border border-red-400 text-red-500 rounded-full"
                >
                  🗑
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              Owner: {p.owner?.name || "—"}
            </p>
            <p className="text-[11px] text-slate-500">
              Status: {p.status}
            </p>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-xs text-slate-500">No projects created yet.</p>
        )}
      </section>
    </div>
  );
}
