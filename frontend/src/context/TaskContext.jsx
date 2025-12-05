import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

const initialState = {
  tasks: [],
  page: 1,
  totalPages: 1,
  loading: false,
  hasNew: false   // ⭐ NEW
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload.tasks,
        page: action.payload.page,
        totalPages: action.payload.totalPages
      };

    case "UPSERT_TASK":
      const exists = state.tasks.find((t) => t._id === action.payload._id);
      if (exists) {
        return {
          ...state,
          tasks: state.tasks.map((t) =>
            t._id === action.payload._id ? action.payload : t
          )
        };
      }
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== action.payload)
      };

    // ⭐ NEW: show green notification dot
    case "NEW_TASK_ALERT":
      return { ...state, hasNew: true };

    // ⭐ NEW: remove dot
    case "CLEAR_ALERT":
      return { ...state, hasNew: false };

    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { socket, user } = useAuth();

  const fetchMyTasks = async (page = 1) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await api.get(`/tasks/my?page=${page}&limit=20`);
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks: data.tasks,
          page: data.page,
          totalPages: data.totalPages
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ⭐ SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    socket.on("task_updated", (task) => {
      dispatch({ type: "UPSERT_TASK", payload: task });

      // user gets new task → show green indicator
      if (task.assignedTo?._id === user?._id) {
        dispatch({ type: "NEW_TASK_ALERT" });
      }
    });

    socket.on("task_deleted", ({ id }) => {
      dispatch({ type: "DELETE_TASK", payload: id });
    });

    return () => {
      socket.off("task_updated");
      socket.off("task_deleted");
    };
  }, [socket, user]);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchMyTasks,

        // ⭐ allow navbar to clear indicator
        markNotificationsRead: () => dispatch({ type: "CLEAR_ALERT" })
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
