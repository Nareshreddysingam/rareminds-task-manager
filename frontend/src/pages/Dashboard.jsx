import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, fetchMyTasks, loading } = useTasks();
  const [createdTasks, setCreatedTasks] = useState([]);

  useEffect(() => {
    fetchMyTasks();
    if (user.role === "manager") {
      api.get("/tasks/created").then(({ data }) => setCreatedTasks(data));
    }
  }, [user.role]);

  const assignedToMe = tasks.filter(
    (t) => t.assignedTo && t.assignedTo._id === user.id
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Hi, {user.name} 👋</h1>
          <p className="text-xs text-slate-500">
            Here&apos;s a quick view of your tasks.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
