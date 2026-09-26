import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import { backendApp } from "./app";
import { connectMongoDB } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend-specific .env
const backendEnv = dotenv.config({ path: path.resolve(__dirname, ".env") }).parsed || {};

// Backend port defaults to 5050 from backend/.env
const PORT = Number(backendEnv.PORT || process.env.BACKEND_PORT || 5050);

async function startServer() {
  const app = express();

  console.log(`[Backend Server] Connecting to MongoDB...`);
  await connectMongoDB();

  // Mount backend API and static files
  app.use(backendApp);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [NCR Backend Server] Running standalone on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base:  http://localhost:${PORT}/api`);
    console.log(`🏠 Properties: http://localhost:${PORT}/api/properties`);
    console.log(`💌 Inquiries:  http://localhost:${PORT}/api/inquiries`);
    console.log(`📁 Uploads:    http://localhost:${PORT}/uploads`);
    console.log(`🍃 MongoDB:    ${process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/"}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend server:", err);
  process.exit(1);
});
