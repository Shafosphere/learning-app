import express from "express";
import detailReportRoutes from "./routes/detailReportRoutes.js"; // Import trasy do raportów szczegółowych

const app = express();
app.use(express.json());

// Ładowanie tras do aplikacji
app.use("/detail", detailReportRoutes); // Wszystkie endpointy zaczynające się od "/detail" będą obsługiwane przez detailReportRoutes

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
