import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";

export default function TrashPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [confirmItem, setConfirmItem] = useState(null);

  const isManager = user.role === "manager";

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks/trash?page=1&limit=50");
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!isManager) return;
    setLoading(true);
    try {
      const { data } = await api.get("/projects/trash");
      setProjects(data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    if (!isManager) return;
    setLoading(true);
    try {
      const { data } = await api.get("/activity/trash?page=1&limit=50");
      setLogs(data.logs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "tasks") loadTasks();
    if (activeTab === "projects") loadProjects();
    if (activeTab === "logs") loadLogs();
  }, [activeTab]);

  // restore
  const restoreTask = async (id) => {
    await api.put(`/tasks/${id}/restore`);
    loadTasks();
  };

  const restoreProject = async (id) => {
    await api.put(`/projects/${id}/restore`);
    loadProjects();
  };

  const restoreLog = async (id) => {
    await api.put(`/activity/${id}/restore`);
    loadLogs();
  };

  // permanent delete
  const askPermanentDelete = (type, id) => {
    if (type === "task" && !isManager) {
      if (window.confirm("Permanently delete this task?")) {
        deleteTask(id, null, false);
      }
    } else {
      setConfirmItem({ type, id });
    }
  };

  const deleteTask = async (id, pwd, useBody = true) => {
    if (useBody) {
      await api.delete(`/tasks/${id}/permanent`, {
        data: { secret: pwd }
      });
    } else {
      await api.delete(`/tasks/${id}/permanent`);
    }
    loadTasks();
  };

  const deleteProject = async (id, pwd) => {
    await api.delete(`/projects/${id}/permanent`, {
      data: { secret: pwd }
    });
    loadProjects();
  };

  const deleteLog = async (id, pwd) => {
    await api.delete(`/activity/${id}/permanent`, {
      data: { secret: pwd }
    });
    loadLogs();
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!confirmItem) return;
    if (!secret.trim()) return;

    const { type, id } = confirmItem;

    if (type === "task") await deleteTask(id, secret.trim(), true);
    if (type === "project") await deleteProject(id, secret.trim());
    if (type === "log") await deleteLog(id, secret.trim());

    setConfirmItem(null);
    setSecret("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-semibold">Trash Bin</h1>

      {/* Tabs */}
      <div className="flex gap-2 text-xs border-b border-slate-600/40">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-3 py-2 border-b-2 ${
            activeTab === "tasks"
              ? "border-red-500 text-red-500"
              : "border-transparent text-slate-500"
          }`}
        >
          Tasks
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-3 py-2 border-b-2 ${
            activeTab === "projects"
              ? "border-red-500 text-red-500"
              : "border-transparent text-slate-500"
          }`}
        >
          Projects
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-3 py-2 border-b-2 ${
            activeTab === "logs"
              ? "border-red-500 text-red-500"
              : "border-transparent text-slate-500"
          }`}
        >
          Activity Logs
        </button>
      </div>

      {loading && (
        <p className="text-xs text-slate-500">Loading {activeTab}…</p>
      )}

      {/* Tasks */}
      {activeTab === "tasks" && !loading && (
        <section className="space-y-2">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-500">No tasks in trash.</p>
          )}

          {tasks.map((t) => (
            <div
              key={t._id}
              className="card p-3 flex justify-between text-xs"
            >
              <div className="flex-1">
                <TaskCard task={t} compact />
                <p className="text-[11px] text-slate-500 mt-1">
                  Trashed at:{" "}
                  {t.trashedAt
                    ? new Date(t.trashedAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => restoreTask(t._id)}
                  className="px-3 py-1 rounded-lg border text-[11px]"
                >
                  Restore
                </button>

                <button
                  onClick={() => askPermanentDelete("task", t._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px]"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {activeTab === "projects" && isManager && !loading && (
        <section className="space-y-2">
          {projects.length === 0 && (
            <p className="text-xs text-slate-500">
              No projects in trash.
            </p>
          )}

          {projects.map((p) => (
            <div
              key={p._id}
              className="card p-3 flex justify-between text-xs"
            >
              <div>
                <h3 className="font-semibold text-sm">{p.name}</h3>
                {p.description && (
                  <p className="text-slate-500">{p.description}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Trashed at:{" "}
                  {p.trashedAt
                    ? new Date(p.trashedAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => restoreProject(p._id)}
                  className="px-3 py-1 rounded-lg border text-[11px]"
                >
                  Restore
                </button>

                <button
                  onClick={() => askPermanentDelete("project", p._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px]"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Logs */}
      {activeTab === "logs" && isManager && !loading && (
        <section className="space-y-2">
          {logs.length === 0 && (
            <p className="text-xs text-slate-500">No logs in trash.</p>
          )}

          {logs.map((log) => (
            <div
              key={log._id}
              className="card p-3 flex justify-between text-xs"
            >
              <div>
                <p className="font-medium">{log.action}</p>
                <p className="text-slate-500">{log.description}</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  By: {log.performedBy?.name || "Unknown"} •{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Trashed at:{" "}
                  {log.trashedAt
                    ? new Date(log.trashedAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => restoreLog(log._id)}
                  className="px-3 py-1 rounded-lg border text-[11px]"
                >
                  Restore
                </button>

                <button
                  onClick={() => askPermanentDelete("log", log._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px]"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Manager password modal */}
      {confirmItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleConfirmDelete}
            className="bg-slate-900 p-4 rounded-lg text-white w-full max-w-xs space-y-3"
          >
            <h2 className="text-sm font-semibold">Enter delete password</h2>

            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-md text-xs"
              placeholder="Manager delete password"
            />

            <div className="flex justify-end gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setConfirmItem(null);
                  setSecret("");
                }}
                className="px-3 py-1 rounded-md border border-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-red-600 text-white"
              >
                Delete forever
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
