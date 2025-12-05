import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ctm_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("ctm_token"));
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const [dark, setDark] = useState(() => {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // 🔥 SOCKET.IO CONNECTION (FINAL FIX)
  useEffect(() => {
    if (!token) return;

    const socketURL = import.meta.env.VITE_SOCKET_URL;
    console.log("🔌 Connecting socket to:", socketURL);

    const s = io(socketURL, {
      transports: ["websocket"],
      withCredentials: false,
    });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    setSocket(s);

    return () => {
      console.log("🔌 Disconnecting socket instance");
      s.disconnect();
    };
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      setUser(data.user);
      setToken(data.token);

      localStorage.setItem("ctm_user", JSON.stringify(data.user));
      localStorage.setItem("ctm_token", data.token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", payload);

      setUser(data.user);
      setToken(data.token);

      localStorage.setItem("ctm_user", JSON.stringify(data.user));
      localStorage.setItem("ctm_token", data.token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ctm_user");
    localStorage.removeItem("ctm_token");

    if (socket) socket.disconnect();
    setSocket(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        socket,
        dark,
        setDark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
