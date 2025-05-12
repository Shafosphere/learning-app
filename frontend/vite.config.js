import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Browser (DOM) emulation for React tests
    globals: true, // Allows usage of test, expect, etc., without importing them
    setupFiles: ["./setupTests.js"], // File containing additional setup
    exclude: [
      "**/*.skip.test.jsx", // Ignore files ending with .skip.test.jsx
      "node_modules/**", // Ignore all files in node_modules
      "dist/**", // Ignore files in the dist folder
      "coverage/**", // Ignore files in the coverage folder
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
