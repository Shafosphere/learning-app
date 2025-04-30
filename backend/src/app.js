// src/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";

import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// JSON + ciasteczka
app.use(express.json());
app.use(cookieParser());

// CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://192.168.0.113:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API-routy
app.use("/report", reportRoutes);
app.use("/auth", authRoutes);
app.use("/word", wordRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/analytics", analyticsRoutes);

// Serwujemy frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "frontend", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

export default app;
