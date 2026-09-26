import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

export const uploadsRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${basename}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// GET /api/uploads/images (List of uploaded images)
uploadsRouter.get("/images", (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.status(200).json([]);
    }
    const files = fs.readdirSync(UPLOADS_DIR);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file))
      .map((file) => `/uploads/${file}`);

    return res.status(200).json(images);
  } catch (err) {
    console.error("Error reading uploads directory:", err);
    return res.status(500).json({ error: "Failed to list uploads" });
  }
});

// POST /api/uploads/images (Upload single or multiple images)
uploadsRouter.post("/images", upload.array("files", 10), (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const urls = files.map((f) => `/uploads/${f.filename}`);

    return res.status(200).json({
      success: true,
      files: urls,
      url: urls[0] || "",
    });
  } catch (err: any) {
    console.error("Image upload error:", err);
    return res.status(500).json({ error: err?.message || "Upload failed" });
  }
});

// POST /api/upload (Generic upload endpoint)
uploadsRouter.post("/", upload.single("file"), (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (file) {
      return res.status(200).json({
        status: "success",
        filename: file.filename,
        url: `/uploads/${file.filename}`,
      });
    }

    // Fallback if uploaded as base64 in body
    const { filename, data } = req.body || {};
    if (data && filename) {
      const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
      const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, safeFilename), Buffer.from(base64Data, "base64"));

      return res.status(200).json({
        status: "success",
        filename: safeFilename,
        url: `/uploads/${safeFilename}`,
      });
    }

    return res.status(200).json({
      status: "success",
      filename: "property_preview.jpg",
      url: "/src/img/img1.jpg",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err?.message || "Upload failed" });
  }
});
