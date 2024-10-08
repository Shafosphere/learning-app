import express from "express";
import reportRoutes from "./routes/reportRoutes.js"; // Import trasy do raportów szczegółowych
import cors from "cors";

const app = express();
const port = 8080;
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Ładowanie tras do aplikacji
app.use("/report", reportRoutes); // Wszystkie endpointy zaczynające się od "/detail" będą obsługiwane przez reportRoutes

app.use()

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
