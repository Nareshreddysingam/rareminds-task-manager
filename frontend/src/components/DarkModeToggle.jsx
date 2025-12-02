import { useAuth } from "../context/AuthContext";

export default function DarkModeToggle() {
  const { dark, setDark } = useAuth();
  return (
    <button
      onClick={() => setDark(!dark)}
      className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1 text-xs font-medium"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
