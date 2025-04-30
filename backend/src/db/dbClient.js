import pg from "pg";
import { config } from "../config/config.js";

const { Pool } = pg;

const pool = new Pool({
  user: config.dbUser,
  host: config.dbHost,
  database: config.dbName,
  password: config.dbPassword,
  port: config.dbPort,
});

export default pool;
