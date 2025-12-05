import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { hasNew, markNotificationsRead } = useTasks();   // ⭐ NEW
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
      ? "font-semibold text-[var(--accent)]"
      : "text-slate-500 dark:text-slate-400";

  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-[color:var(--card)]/90 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">

        {/* Left logo */}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs font-bold">
            R
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm md:text-base font-semibold">
              Rareminds Task Manager
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Smart team & project control
            </span>
          </div>
          <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
            ({user.role})
          </span>
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-3 text-xs md:text-sm">

          <Link to="/dashboard" className={isActive("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/projects" className={isActive("/projects")}>
            Projects
          </Link>

          {/* ⭐ TASKS with GREEN INDICATOR */}
          <button
            onClick={() => {
              navigate("/tasks");
              markNotificationsRead();
            }}
            className={`relative ${isActive("/tasks")}`}
          >
            Tasks
            {hasNew && (
              <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
            )}
          </button>

          <Link to="/activity" className={isActive("/activity")}>
            Activity
          </Link>

          <Link to="/trash" className={isActive("/trash")}>
            Trash
          </Link>

          <DarkModeToggle />

          <span className="hidden md:inline text-slate-500 dark:text-slate-300">
            {user.name}
          </span>

          <button
            onClick={logout}
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
