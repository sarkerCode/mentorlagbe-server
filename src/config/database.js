
import { MongoClient } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI);

let database;

export const connectDB = async () => {
  try {
    await client.connect();

    database = client.db(env.DB_NAME);

    await database.command({ ping: 1 });

    console.log(`MongoDB connected: ${env.DB_NAME}`);

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export const getDB = () => {
  if (!database) {
    throw new Error("Database is not connected yet");
  }

  return database;
};
