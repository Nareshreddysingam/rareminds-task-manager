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

// SOCKET.IO (must match frontend domain)
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://rareminds-task-manager.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// CONNECT DATABASE
connectDB();

// GLOBAL CORS MIDDLEWARE
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rareminds-task-manager.vercel.app"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

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
  console.log("🔌 Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected", socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
