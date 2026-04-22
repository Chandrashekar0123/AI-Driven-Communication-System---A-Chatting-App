import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(".env") });

const connectDB = async () => {
  try {
    const localURI = "mongodb://localhost:27017/chat_app";
    console.log("Connecting to local MongoDB:", localURI);
    const conn = await mongoose.connect(localURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();
