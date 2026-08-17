import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    coverPreset: {
      type: String,
      default: "from-purple-900 via-indigo-900 to-slate-900",
    },
    userPresence: {
      type: String,
      default: "Online",
    },
    status: {
      type: String,
      default: "Hey there! I am using Chatty.",
    },
    bio: {
      type: String,
      default: "",
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      theme: { type: String, default: "dark" },
      notifications: { type: Boolean, default: true },
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
