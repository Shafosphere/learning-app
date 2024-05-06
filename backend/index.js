import express from "express";
import cors from "cors";

const app = express();
const port = 8080;

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
app.use(cors(corsOptions));

app.get('/api/data', (req, res) => {
    // Handle your API logic here
    const data = { message: 'working' };
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});