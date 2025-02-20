import express from "express";
import reportRoutes from "./routes/reportRoutes.js"; // Import trasy do raportów szczegółowych
import authRoutes from "./routes/authRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser"; 
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { initializeCronJobs } from "./cronJobs.js";

import cors from "cors";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "http://192.168.0.113:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`Request method: ${req.method}, Request path: ${req.path}`);
  next();
})


// Ładowanie tras do aplikacji
app.use("/report", reportRoutes); // Wszystkie endpointy zaczynające się od "/report" będą obsługiwane przez reportRoutes

app.use("/auth", authRoutes);

app.use("/word", wordRoutes);

app.use("/admin", adminRoutes);

app.use("/user", userRoutes);

app.use("/analytics", analyticsRoutes);

initializeCronJobs();

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
