import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TaskManagement from "./pages/TaskManagement";
import ActivityLogPage from "./pages/ActivityLogPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Projects from "./pages/Projects";

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* PROJECTS PAGE (Manager + Users both can view) */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />

            {/* Task Management */}
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskManagement />
                </ProtectedRoute>
              }
            />

            {/* Activity Logs */}
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivityLogPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
  );
}
