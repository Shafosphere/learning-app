import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeCronJobs } from "./cronJobs.js";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173", "http://192.168.0.113:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`Request method: ${req.method}, Request path: ${req.path}`);
  next();
});

// Definiowanie tras API
app.use("/report", reportRoutes);
app.use("/auth", authRoutes);
app.use("/word", wordRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/analytics", analyticsRoutes);

initializeCronJobs();

// Ustalanie ścieżki do katalogu frontendu (zakładając, że build znajduje się w frontend/build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "frontend", "build")));

// Catch-all route – dla wszystkich pozostałych żądań zwracany jest index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
