import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.model.js";
import Message from "../src/models/message.model.js";
import Group from "../src/models/group.model.js";

dotenv.config();

const initDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is missing in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const models = [User, Message, Group];

    for (const model of models) {
      console.log(`Initializing collection for ${model.modelName}...`);
      await model.createCollection();
      await model.syncIndexes();
      console.log(`✅ ${model.modelName} collection and indexes ready.`);
    }

    console.log("\nDatabase structure created successfully without collisions.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initDB();
