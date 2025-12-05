import axios from "axios";

// Backend API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Automatically attach Authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ctm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
