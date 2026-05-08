import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/user.model.js";
import Message from "../src/models/message.model.js";
import Group from "../src/models/group.model.js";

dotenv.config();

const seedAll = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is missing in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully to:", uri);

    // 1. Create/Find Admin User
    const adminEmail = "admin@chat.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log("Creating admin user...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      admin = new User({
        fullName: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        status: "I am the Admin.",
      });
      await admin.save();
      console.log("✅ Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }

    // 2. Create a Test Group
    let testGroup = await Group.findOne({ name: "System Support" });
    if (!testGroup) {
      console.log("Creating test group...");
      testGroup = new Group({
        name: "System Support",
        description: "Central hub for system announcements.",
        admin: admin._id,
        members: [admin._id],
      });
      await testGroup.save();
      console.log("✅ Test group created.");
    } else {
      console.log("Test group already exists.");
    }

    // 3. Create a Test Message
    const testMessage = await Message.findOne({ text: "Welcome to Chatting-admin!" });
    if (!testMessage) {
      console.log("Creating test message...");
      const msg = new Message({
        senderId: admin._id,
        groupId: testGroup._id,
        text: "Welcome to Chatting-admin!",
      });
      await msg.save();
      console.log("✅ Test message created.");
    } else {
      console.log("Test message already exists.");
    }

    console.log("\nDatabase 'Chatting-admin' initialized successfully with sample data.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedAll();
