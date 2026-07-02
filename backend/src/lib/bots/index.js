import Message from "../../models/message.model.js";
import { getReceiverSocketId, io } from "../socket.js";
import Group from "../../models/group.model.js";

// Hardcoded Bot IDs for simplicity (in a real app, these would be in the DB)
export const BOT_IDENTITIES = {
  POLL_BOT: { _id: "bot_poll", fullName: "PollBot", isBot: true, profilePic: "/bot.png" },
  REMIND_BOT: { _id: "bot_remind", fullName: "RemindBot", isBot: true, profilePic: "/bot.png" }
};

export const handleBotCommands = async (message) => {
  const text = message.text || "";
  
  // Check if message is invoking a bot command
  if (text.startsWith("@PollBot") || text.startsWith("/poll")) {
    await processPollCommand(message);
  } else if (text.startsWith("@RemindBot") || text.startsWith("/remind")) {
    await processRemindCommand(message);
  }
};

const sendBotMessage = async (botIdentity, text, originalMessage) => {
  const targetGroupId = originalMessage.groupId;
  const targetReceiverId = originalMessage.groupId ? null : originalMessage.senderId;

  // We don't save virtual bot messages to the DB for this simple implementation.
  // Instead, we just emit them via socket so they appear in real-time.
  
  const socketPayload = {
    _id: "virtual_" + Date.now() + Math.random(),
    senderId: botIdentity,
    receiverId: targetReceiverId,
    groupId: targetGroupId,
    text: text,
    createdAt: new Date(),
  };

  if (targetGroupId) {
    const group = await Group.findById(targetGroupId).lean();
    if (group) {
      group.members.forEach((memberId) => {
        const receiverSocketId = getReceiverSocketId(memberId);
        if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", socketPayload);
      });
    }
  } else {
    // Send to the original sender
    const receiverSocketId = getReceiverSocketId(targetReceiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", socketPayload);
  }
};

const processPollCommand = async (message) => {
  const text = message.text.replace(/@PollBot|\/poll/gi, "").trim();
  if (!text) {
    await sendBotMessage(BOT_IDENTITIES.POLL_BOT, "Usage: /poll Question? Option1, Option2", message);
    return;
  }
  
  const parts = text.split("?");
  if (parts.length < 2) {
    await sendBotMessage(BOT_IDENTITIES.POLL_BOT, "Please include a '?' after the question.", message);
    return;
  }

  const question = parts[0] + "?";
  const options = parts[1].split(",").map(o => o.trim()).filter(o => o);

  if (options.length < 2) {
    await sendBotMessage(BOT_IDENTITIES.POLL_BOT, "Please provide at least 2 comma-separated options.", message);
    return;
  }

  const pollText = `📊 **POLL: ${question}**\n\n` + options.map((opt, i) => `${i + 1}️⃣ ${opt}`).join("\n") + `\n\nReact with the corresponding number emoji!`;
  await sendBotMessage(BOT_IDENTITIES.POLL_BOT, pollText, message);
};

const processRemindCommand = async (message) => {
  const text = message.text.replace(/@RemindBot|\/remind/gi, "").trim();
  if (!text) {
    await sendBotMessage(BOT_IDENTITIES.REMIND_BOT, "Usage: /remind [minutes] [message]", message);
    return;
  }

  const parts = text.split(" ");
  const minutes = parseInt(parts[0]);
  if (isNaN(minutes)) {
    await sendBotMessage(BOT_IDENTITIES.REMIND_BOT, "Please provide a valid number of minutes. Example: /remind 5 Check the oven", message);
    return;
  }

  const reminderText = parts.slice(1).join(" ");
  await sendBotMessage(BOT_IDENTITIES.REMIND_BOT, `Got it! I will remind you to "${reminderText}" in ${minutes} minute(s). ⏰`, message);

  // Schedule the reminder
  setTimeout(async () => {
    await sendBotMessage(BOT_IDENTITIES.REMIND_BOT, `⏰ **REMINDER:** ${reminderText}`, message);
  }, minutes * 60 * 1000);
};
