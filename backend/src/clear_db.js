import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for clearing...");

    const collections = ["users", "messages", "groups"];
    for (const col of collections) {
      try {
        await mongoose.connection.db.dropCollection(col);
        console.log(`Dropped collection: ${col}`);
      } catch (e) {
        console.log(`Collection ${col} does not exist or already dropped.`);
      }
    }

    console.log("Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

clearDB();
