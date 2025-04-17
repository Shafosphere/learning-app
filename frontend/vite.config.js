import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Emulacja przeglądarki (DOM) dla testów React
    globals: true, // Możliwość używania np. test, expect bez importu
    setupFiles: ["./setupTests.js"], // Plik z dodatkowymi ustawieniami
    exclude: [
      "**/*.skip.test.jsx", // Ignoruj pliki z .skip.test.jsx
      "node_modules/**", // Ignoruj wszystkie pliki w node_modules
      "dist/**", // Ignoruj pliki w folderze dist
      "coverage/**", // Ignoruj pliki w folderze coverage
    ],
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
      "/report": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
      "/word": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
      "/admin": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
      "/user": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
      "/analytics": {
        target: "http://192.168.0.113:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
