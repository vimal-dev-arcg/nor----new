import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth";
import { propertiesRouter } from "./routes/properties";
import { inquiriesRouter } from "./routes/inquiries";
import { uploadsRouter } from "./routes/uploads";
import { aiRouter } from "./routes/ai";

export const backendApp = express();

// Middleware
backendApp.use(cors());
backendApp.use(express.json({ limit: "50mb" }));
backendApp.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads directory serving
const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
backendApp.use("/uploads", express.static(uploadsDir));

// Health check endpoint
backendApp.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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

