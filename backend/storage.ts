import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "backend", "data");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadProperties(seedData: any[] = []): any[] {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const content = fs.readFileSync(PROPERTIES_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading properties file:", err);
  }

  // Fallback to seed data and persist
  saveProperties(seedData);
  return seedData;
}

export function saveProperties(properties: any[]): void {
  try {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving properties file:", err);
  }
}

export function loadInquiries(seedData: any[] = []): any[] {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const content = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading inquiries file:", err);
  }

  // Fallback to seed data and persist
  saveInquiries(seedData);
  return seedData;
}

export function saveInquiries(inquiries: any[]): void {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving inquiries file:", err);
  }
}
