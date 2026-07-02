import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic, avatar, members = [] } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Ensure the creator is an admin and a member
    const groupMembers = [...new Set([...members, userId.toString()])];

    const group = new Group({
      name,
      description,
      isPublic,
      avatar,
      members: groupMembers,
      admins: [userId],
    });

    await group.save();
    
    const populatedGroup = await Group.findById(group._id).populate("members", "fullName profilePic");
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).populate("members", "fullName profilePic");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPublicGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find public groups where the user is NOT a member
    const groups = await Group.find({ isPublic: true, members: { $ne: userId } });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getPublicGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "Already a member of this group" });
    }

    if (!group.isPublic) {
      // In a real app, you'd handle join requests for private groups
      return res.status(403).json({ error: "Cannot join a private group directly" });
    }

    group.members.push(userId);
    await group.save();

    const populatedGroup = await Group.findById(group._id).populate("members", "fullName profilePic");
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in joinGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.members.includes(userId)) {
      return res.status(400).json({ error: "Not a member of this group" });
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());

    // If no members left, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(id);
      return res.status(200).json({ message: "Group deleted as it has no members" });
    }

    // If no admins left but members exist, make the first member an admin
    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins.push(group.members[0]);
    }

    await group.save();
    res.status(200).json({ success: true, groupId: id });
  } catch (error) {
    console.error("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: newMemberId } = req.body;
    const reqUserId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(reqUserId)) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    if (group.members.includes(newMemberId)) {
      return res.status(400).json({ error: "User is already a member" });
    }

    group.members.push(newMemberId);
    await group.save();

    res.status(200).json({ success: true, message: "Member added" });
  } catch (error) {
    console.error("Error in addMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const reqUserId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(reqUserId)) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    if (memberId.toString() === reqUserId.toString()) {
      return res.status(400).json({ error: "Use leave group to remove yourself" });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== memberId.toString());

    await group.save();
    res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Error in removeMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
