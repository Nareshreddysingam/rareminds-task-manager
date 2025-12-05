import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const { user } = useAuth();

  // always an array
  const { tasks = [], fetchMyTasks, loading } = useTasks();

  const [createdTasks, setCreatedTasks] = useState([]);

  // ⭐ NEW: Dashboard activity notifications panel
  const [panelLogs, setPanelLogs] = useState([]);

  useEffect(() => {
    fetchMyTasks();
    if (user.role === "manager") {
      api.get("/tasks/created").then(({ data }) => setCreatedTasks(data));
    }

    // Load 5 recent activities
    api.get("/activity?page=1&limit=5").then(({ data }) => {
      setPanelLogs(data.logs || []);
    });
  }, [user.role]);

  const assignedToMe = tasks.filter(
    (t) => t.assignedTo && t.assignedTo._id === user.id
  );

  const clearHomePanel = () => setPanelLogs([]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Hi, {user.name} 👋</h1>
          <p className="text-xs text-slate-500">
            Here&apos;s a quick view of your tasks.
          </p>
        </div>
      </div>

      {/* ⭐ NEW: Recent Activity Panel */}
      <section className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <button
            onClick={clearHomePanel}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        </div>

        {panelLogs.length === 0 && (
          <p className="text-[11px] text-slate-500">No notifications.</p>
        )}

        {panelLogs.map((log) => (
          <p key={log._id} className="text-[11px] text-slate-300">
            {log.description}
          </p>
        ))}
      </section>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Assigned tasks */}
        <section className="card p-4">
          <h2 className="text-sm font-semibold mb-2">
            Tasks assigned to you ({assignedToMe.length})
          </h2>

          {loading && (
            <p className="text-xs text-slate-500">Loading your tasks...</p>
          )}

          {!loading && assignedToMe.length === 0 && (
            <p className="text-xs text-slate-500">No tasks assigned yet.</p>
          )}

          {assignedToMe.map((t) => (
            <TaskCard key={t._id} task={t} />
          ))}
        </section>

        {/* Manager created tasks */}
        {user.role === "manager" && (
          <section className="card p-4">
            <h2 className="text-sm font-semibold mb-2">
              Tasks you created ({createdTasks.length})
            </h2>

            {createdTasks.length === 0 && (
              <p className="text-xs text-slate-500">
                You haven&apos;t created any tasks yet.
              </p>
            )}

            {createdTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </section>
        )}

      </div>
    </div>
  );
}
