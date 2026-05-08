import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const checkCollections = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Current Database:", mongoose.connection.name);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections found:");
    collections.forEach(c => console.log(` - ${c.name}`));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkCollections();
