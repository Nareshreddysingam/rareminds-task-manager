import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogPage() {
  const { socket } = useAuth();
  const [logs, setLogs] = useState([]);
  const [page] = useState(1);

  const fetchLogs = async () => {
    const { data } = await api.get(`/activity?page=${page}&limit=20`);
    setLogs(data.logs);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onLog = (log) => {
      setLogs((prev) => [log, ...prev]);
    };
    socket.on("activity_log", onLog);
    return () => {
      socket.off("activity_log", onLog);
    };
  }, [socket]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-2">Activity log</h1>
      <p className="text-xs text-slate-500 mb-4">
        Real-time logs for task changes.
      </p>
      <div className="space-y-2">
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
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-xs text-slate-500">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
