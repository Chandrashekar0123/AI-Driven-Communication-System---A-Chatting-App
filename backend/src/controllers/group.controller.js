import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members, profilePic } = req.body;
    const adminId = req.user._id;

    let imageUrl = "";
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      imageUrl = uploadResponse.secure_url;
    }

    const newGroup = new Group({
      name,
      admin: adminId,
      members: [...members, adminId],
      profilePic: imageUrl,
    });

    await newGroup.save();

    // Notify all members via socket
    newGroup.members.forEach((memberId) => {
      const receiverSocketId = getReceiverSocketId(memberId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newGroup", newGroup);
      }
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).populate("members", "-password");
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getGroups controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, profilePic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can update group" });
    }

    if (name) group.name = name;
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      group.profilePic = uploadResponse.secure_url;
    }

    await group.save();

    // Notify members
    group.members.forEach((memberId) => {
      const receiverSocketId = getReceiverSocketId(memberId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("groupUpdated", group);
      }
    });

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in updateGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
