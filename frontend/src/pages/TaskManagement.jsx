import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function TaskManagement() {
  const { user } = useAuth();
  const { tasks, fetchMyTasks } = useTasks();

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    project: "",
    priority: "medium"
  });

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ----------------------------
  //   IMPORTANT FIX HERE
  // ----------------------------
  useEffect(() => {
    if (!user) return; // wait until user loads

    fetchMyTasks();

    if (user.role === "manager") {
      api.get("/auth/users").then(({ data }) => setUsers(data));
      api.get("/projects").then(({ data }) => setProjects(data));
    }
  }, [user]); // run again when user becomes available

  const createTask = async (e) => {
    e.preventDefault();

    if (!form.title || !form.assignedTo) {
      setError("Title and assignee are required");
      return;
    }

    setError("");
    setCreating(true);

    try {
      await api.post("/tasks", form);
      await fetchMyTasks();

      setForm({
        title: "",
        description: "",
        assignedTo: "",
        project: "",
        priority: "medium"
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
    } catch (err) {
      console.error(err);
    }
  };

  // Prevent crash if tasks = undefined
  const safeTasks = tasks || [];

  const columns = {
    todo: { title: "To Do", items: safeTasks.filter((t) => t.status === "todo") },
    in_progress: {
      title: "In Progress",
      items: safeTasks.filter((t) => t.status === "in_progress")
    },
    done: { title: "Done", items: safeTasks.filter((t) => t.status === "done") }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    await updateStatus(draggableId, newStatus);
  };

  if (!user) return <div className="text-center text-white p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Task Management</h1>
          <p className="text-xs text-slate-500">
            Create, assign, and track tasks for Rareminds projects.
          </p>
        </div>
      </div>

      {/* Manager: Create Task */}
      {user.role === "manager" && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Create new task</h2>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

          <form
            onSubmit={createTask}
            className="grid md:grid-cols-4 gap-3 text-xs"
          >
            <div className="md:col-span-2">
              <label className="font-medium">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium">Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-medium">Project</label>
              <select
                name="project"
                value={form.project}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
              >
                <option value="">Unassigned</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium">Assign to</label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                disabled={creating}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-medium"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Kanban Board */}
      <section className="grid md:grid-cols-3 gap-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([key, col]) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="card p-3 min-h-[200px]"
                >
                  <h3 className="text-sm font-semibold mb-2">
                    {col.title} ({col.items.length})
                  </h3>

                  {col.items.map((t, index) => (
                    <Draggable key={t._id} draggableId={t._id} index={index}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <TaskCard
                            task={t}
                            onStatusChange={updateStatus}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </section>
    </div>
  );
}
