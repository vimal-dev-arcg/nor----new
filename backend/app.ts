import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth";
import { propertiesRouter } from "./routes/properties";
import { inquiriesRouter } from "./routes/inquiries";
import { uploadsRouter } from "./routes/uploads";
import { aiRouter } from "./routes/ai";

export const backendApp = express();

// Enable CORS for separate frontend development (Vite on :5173, etc.)
backendApp.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost on any port (5173, 3000, 5050, etc.) and deployment URLs
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

backendApp.use(express.json({ limit: "50mb" }));
backendApp.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory serving with fallbacks
const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
const srcImgDir = path.resolve(process.cwd(), "src", "img");
const publicImgDir = path.resolve(process.cwd(), "public", "img");

backendApp.use("/uploads", express.static(uploadsDir));
backendApp.use("/uploads", express.static(srcImgDir));
backendApp.use("/uploads", express.static(publicImgDir));

// Health check endpoint
backendApp.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    port: process.env.BACKEND_PORT || process.env.PORT || 5050,
    timestamp: new Date().toISOString(),
  });
});

// Mount specialized routers
backendApp.use("/api/auth", authRouter);
backendApp.use("/api/properties", propertiesRouter);
backendApp.use("/api/inquiries", inquiriesRouter);
backendApp.use("/api/uploads", uploadsRouter);
backendApp.use("/api/upload", uploadsRouter);
backendApp.use("/api/ai", aiRouter);

// Catch unhandled API requests
backendApp.use("/api", (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});
