import dotenv from 'dotenv';

dotenv.config({ path: "./.env.local" }); // Wczytanie zmiennych z pliku .env

export const config = {
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: process.env.DB_PORT,
  tokenKey: process.env.TOKEN_KEY,
  pin: process.env.ADMIN_PIN,
};
