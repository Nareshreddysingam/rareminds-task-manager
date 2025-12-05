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

// ⭐ ALL ALLOWED ORIGINS (STABLE + CLEAN)
const allowedOrigins = [
  "http://localhost:5173",

  // Your Vercel main deploy
  "https://rareminds-task-manager-326tf1lj6.vercel.app",

  // Any Vercel preview domain
  /^https:\/\/.*\.vercel\.app$/,

  // Backend domain (Render)
  "https://rareminds-task-manager.onrender.com"
];

// ⭐ GLOBAL CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // allow exact matches
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow *.vercel.app
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS not allowed for: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ⭐ CONNECT DATABASE
connectDB();

// ⭐ SOCKET.IO (GLOBAL CORS)
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

      return callback("CORS blocked: " + origin, false);
    },
    credentials: true,
    methods: ["GET", "POST"],
  }
});

// ⭐ API ROUTES (CORRECT PREFIX)
app.use("/api/auth", authRoutes);
app.use("/api/tasks", createTaskRoutes(io));
app.use("/api/activity", activityRoutes);
app.use("/api/projects", projectRoutes);

// ⭐ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Collaborative Task Manager API is running");
});

// ⭐ SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ⭐ START SERVER
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
