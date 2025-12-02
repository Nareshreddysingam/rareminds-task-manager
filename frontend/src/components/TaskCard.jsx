// frontend/src/components/TaskCard.jsx
export default function TaskCard({
  task,
  onStatusChange,
  isDragging,
  canManage,
  onArchive,
  onTrash
}) {
  const statusLabel = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done"
  }[task.status];

  return (
    <div
      className={`card p-3 mb-3 ${
        isDragging ? "ring-2 ring-red-400 shadow-lg" : ""
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-sm">{task.title}</h3>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {task.description}
            </p>
          )}

          {task.project?.name && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Project: {task.project.name}
            </p>
          )}

          <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
            Created by: {task.createdBy?.name || "—"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Assigned to: {task.assignedTo?.name || "—"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Priority: {task.priority}
          </p>
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
          {statusLabel}
        </span>
      </div>

      {onStatusChange && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {["todo", "in_progress", "done"].map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(task._id, s)}
              className={`px-2 py-0.5 rounded-full border ${
                task.status === s
                  ? "border-red-500 text-red-600"
                  : "border-slate-300 dark:border-slate-600 text-slate-500"
              }`}
            >
              {s === "todo"
                ? "To Do"
                : s === "in_progress"
                ? "In Progress"
                : "Done"}
            </button>
          ))}
        </div>
      )}

      {canManage && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {onArchive && (
            <button
              onClick={() => onArchive(task._id, !task.isArchived)}
              className="px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
            >
              {task.isArchived ? "Unarchive" : "Archive"}
            </button>
          )}

          {onTrash && (
            <button
              onClick={() => onTrash(task._id)}
              className="px-2 py-0.5 rounded-full border border-red-400 text-red-600"
            >
              Move to Trash
            </button>
          )}
        </div>
      )}
    </div>
  );
}
