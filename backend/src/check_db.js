import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const testConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Attempting to connect to:", uri.split("@")[1] || "Local/Hidden URI");
    
    const conn = await mongoose.connect(uri);
    console.log("--- CONNECTION STATUS ---");
    console.log("Status: SUCCESS");
    console.log("Host:", conn.connection.host);
    
    if (conn.connection.host.includes("mongodb.net")) {
      console.log("Database Type: CLOUD (MongoDB Atlas)");
    } else {
      console.log("Database Type: LOCAL (localhost/127.0.0.1)");
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("--- CONNECTION STATUS ---");
    console.error("Status: FAILED");
    console.error("Error:", error.message);
    process.exit(1);
  }
};

testConnection();
