import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mockApiPlugin } from "./src/server/mockApiPlugin.js";

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: "all",
  },
});
