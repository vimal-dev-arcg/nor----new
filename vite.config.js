import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
