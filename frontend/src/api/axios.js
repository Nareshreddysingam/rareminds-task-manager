import axios from "axios";

// Backend API base URL (already includes /api from .env)
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ctm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
