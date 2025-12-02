import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

const initialState = {
  tasks: [],
  page: 1,
  totalPages: 1,
  loading: false
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
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { socket } = useAuth();

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

  useEffect(() => {
    if (!socket) return;

    const onUpdated = (task) => {
      dispatch({ type: "UPSERT_TASK", payload: task });
    };
    const onDeleted = ({ id }) => {
      dispatch({ type: "DELETE_TASK", payload: id });
    };

    socket.on("task_updated", onUpdated);
    socket.on("task_deleted", onDeleted);

    return () => {
      socket.off("task_updated", onUpdated);
      socket.off("task_deleted", onDeleted);
    };
  }, [socket]);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchMyTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
