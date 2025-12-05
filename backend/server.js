import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import createTaskRoutes from "./routes/taskRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// ⭐ IMPORTANT → YOUR VERCEL FRONTEND URL
const allowedOrigins = [
  "http://localhost:5173",

  // ⭐ Frontend on Vercel
  "https://rareminds-task-manager-326tf1lj6.vercel.app",

  // ⭐ Optional extra vercel preview domains
  "https://*.vercel.app",
  "https://vercel.app",

  // ⭐ Backend allowed (Render)
  "https://rareminds-task-manager.onrender.com"
];

// ⭐ DYNAMIC CORS HANDLER
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    console.log("❌ BLOCKED ORIGIN:", origin);
    return callback(new Error("CORS Not Allowed: " + origin));
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ⭐ DATABASE
connectDB();

// ⭐ SOCKET.IO with correct CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/tasks", createTaskRoutes(io));
app.use("/api/activity", activityRoutes);
app.use("/api/projects", projectRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Collaborative Task Manager API is running");
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
