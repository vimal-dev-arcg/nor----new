import "dotenv/config";
import express from "express";
import { backendApp } from "./app";
import { connectMongoDB } from "./db";

// Use BACKEND_PORT or PORT, defaulting to 5050 when run standalone
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT) || 5050;

async function startStandaloneBackend() {
  const app = express();

  console.log(`[Backend Server] Initializing MongoDB connection...`);
  // Connect to MongoDB (will connect to MONGODB_URI or fallback cleanly)
  await connectMongoDB();

  // Mount backend API and uploads
  app.use(backendApp);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [NCR Backend Server] Running standalone on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🏠 Properties: http://localhost:${PORT}/api/properties`);
    console.log(`💌 Inquiries: http://localhost:${PORT}/api/inquiries`);
    console.log(`📁 Uploads:   http://localhost:${PORT}/uploads`);
    console.log(`🍃 MongoDB:   ${process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/"}`);
    console.log(`======================================================\n`);
  });
}

startStandaloneBackend().catch((err) => {
  console.error("Failed to start standalone backend server:", err);
  process.exit(1);
});
