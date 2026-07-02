import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Can be text or image URL
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
  },
  { timestamps: true }
);

// TTL index to automatically delete expired statuses
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Status = mongoose.model("Status", statusSchema);

export default Status;
