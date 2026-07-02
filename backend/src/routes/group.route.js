import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getGroups,
  getPublicGroups,
  joinGroup,
  leaveGroup,
  addMember,
  removeMember,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/public", protectRoute, getPublicGroups);
router.post("/join/:id", protectRoute, joinGroup);
router.post("/leave/:id", protectRoute, leaveGroup);
router.post("/add/:id", protectRoute, addMember);
router.delete("/remove/:id/:memberId", protectRoute, removeMember);

export default router;
