import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Summary = mongoose.model("Summary", summarySchema);

export default Summary;
