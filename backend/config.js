import dotenv from 'dotenv';

dotenv.config({ path: "./.env.local" }); // Wczytanie zmiennych z pliku .env

export const config = {
  dbUser: process.env.REACT_APP_DB_USER,
  dbHost: process.env.REACT_APP_DB_HOST,
  dbName: process.env.REACT_APP_DB_NAME,
  dbPassword: process.env.REACT_APP_DB_PASSWORD,
  dbPort: process.env.REACT_APP_DB_PORT,
  tokenKey: process.env.REACT_APP_TOKEN_KEY,
};
