import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find data directory reliably whether running from project root or inside backend folder
function resolveDataDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "backend", "data"),
    path.resolve(process.cwd(), "data"),
    path.resolve(__dirname, "data"),
    path.resolve(__dirname, "..", "data"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  // Fallback: create directory where appropriate
  const fallback = fs.existsSync(path.resolve(process.cwd(), "data"))
    ? path.resolve(process.cwd(), "data")
    : path.resolve(process.cwd(), "backend", "data");

  try {
    fs.mkdirSync(fallback, { recursive: true });
  } catch {
    // Ignore if already exists
  }
  return fallback;
}

const DATA_DIR = resolveDataDir();
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

export function loadProperties(seedData: any[] = []): any[] {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const content = fs.readFileSync(PROPERTIES_FILE, "utf-8");
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error("Error reading properties file:", err);
  }

  // Fallback to seed data and persist
  if (Array.isArray(seedData) && seedData.length > 0) {
    saveProperties(seedData);
    return seedData;
  }
  return [];
}

export function saveProperties(properties: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving properties file:", err);
  }
}

export function loadInquiries(seedData: any[] = []): any[] {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const content = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error("Error reading inquiries file:", err);
  }

  // Fallback to seed data and persist
  if (Array.isArray(seedData) && seedData.length > 0) {
    saveInquiries(seedData);
    return seedData;
  }
  return [];
}

export function saveInquiries(inquiries: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving inquiries file:", err);
  }
}
