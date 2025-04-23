// index.js
import app from "./app.js";
import { initializeCronJobs } from "./cronJobs.js";

const PORT = process.env.PORT || 8080;

// ruszamy cron’y
initializeCronJobs();

// ruszamy serwer
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
