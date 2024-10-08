import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.REACT_APP_DB_USER,
  host: process.env.REACT_APP_DB_HOST,
  database: process.env.REACT_APP_DB_NAME,
  password: process.env.REACT_APP_DB_PASSWORD,
  port: process.env.REACT_APP_DB_PORT,
});

export default pool;