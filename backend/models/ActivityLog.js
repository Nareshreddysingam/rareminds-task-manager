import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogPage() {
  const { socket, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get(`/activity?page=1&limit=20`);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Activity load error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLogs();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleNewLog = (log) => {
      setLogs((prev) => [log, ...prev]);
    };
    socket.on("activity_log", handleNewLog);

    return () => socket.off("activity_log", handleNewLog);
  }, [socket]);

  // ⭐ NEW — Move activity log to trash
  const deleteLog = async (id) => {
    try {
      await api.put(`/activity/${id}/trash`);
      setLogs((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      console.error("Trash log error:", err);
      alert("Failed: " + err.message);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading activity...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-2">Activity log</h1>
      <p className="text-xs text-slate-500 mb-4">
        Real-time logs for task changes.
      </p>

      <div className="space-y-2">
        {logs.length === 0 && (
          <p className="text-xs text-slate-500">No activity yet.</p>
        )}

        {logs.map((log) => (
          <div
            key={log._id}
            className="card px-3 py-2 flex justify-between items-center text-xs"
          >
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {log.description}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                By {log.performedBy?.name || "Unknown"} •{" "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Delete icon */}
            {user.role === "manager" && (
              <button
                onClick={() => deleteLog(log._id)}
                className="text-red-400 hover:text-red-600 text-lg"
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
