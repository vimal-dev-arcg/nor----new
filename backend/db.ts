import mongoose from "mongoose";

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectMongoDB(): Promise<boolean> {
  const rawUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";
  let uri = rawUri.trim();

  // If user provided mongodb://127.0.0.1:27017/ or mongodb://localhost:27017/, ensure database name is specified
  const targetDbName = process.env.MONGODB_DB_NAME || "ncr_properties";

  try {
    console.log(`[MongoDB] Connecting to: ${uri} (db: ${targetDbName})`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
      dbName: targetDbName,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri} -> database: ${targetDbName}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.log(
      `[MongoDB] Notice: Could not connect to MongoDB at ${uri} (${err?.message || "connection error"}).`
    );
    console.log(
      `[MongoDB] Running in clean local storage mode. Once your local MongoDB (mongodb://127.0.0.1:27017/) is running, it will automatically connect.`
    );
    return false;
  }
}
