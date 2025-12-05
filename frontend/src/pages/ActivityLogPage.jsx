import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogPage() {
  const { socket, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isManager = user?.role === "manager";

  const fetchLogs = async () => {
    try {
      const { data } = await api.get(`/activity?page=1&limit=50`);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const onLog = (log) => setLogs((prev = []) => [log, ...prev]);

    socket.on("activity_log", onLog);
    return () => socket.off("activity_log", onLog);
  }, [socket]);

  const moveLogToTrash = async (id) => {
    if (!window.confirm("Move this log to Trash?")) return;

    try {
      await api.put(`/activity/${id}/trash`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const clearFromView = () => {
    if (window.confirm("Clear panel? (Not deleting from backend)"))
      setLogs([]);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-xs text-slate-500">Loading activity…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-lg font-semibold">Activity log</h1>
          <p className="text-xs text-slate-500">Real-time task updates.</p>
        </div>

        <button
          onClick={clearFromView}
          className="text-[11px] px-3 py-1 rounded-full border border-slate-500"
        >
          Clear panel
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {logs.length === 0 && (
        <p className="text-xs text-slate-500">No activity yet.</p>
      )}

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log._id}
            className="card px-3 py-2 flex justify-between items-center text-xs"
          >
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-slate-500">{log.description}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                By {log.performedBy?.name || "Unknown"} •{" "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

            {isManager && (
              <button
                onClick={() => moveLogToTrash(log._id)}
                className="text-[11px] px-2 py-1 border border-red-400 text-red-500 rounded-full hover:bg-red-500/10"
              >
                🗑
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
