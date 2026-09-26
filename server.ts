import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { backendApp } from "./backend/app";
import { connectMongoDB } from "./backend/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Connect to MongoDB if available (falls back gracefully to JSON storage if offline)
  connectMongoDB().catch((err) => {
    console.log("[MongoDB] Deferred initialization notice:", err?.message);
  });

  // 1. Mount backend API and static uploads
  app.use(backendApp);

  // 2. Frontend handling (Vite dev middleware vs production static files)
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));

    app.use((_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NCR Properties Full-Stack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
