import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  handleAIFeature, 
  getAIRecommendations, 
  getChatSummary, 
  getMessages, 
  getUsersForSidebar, 
  sendMessage,
  deleteMessage,
  markAsSeen,
  editMessage,
  reactToMessage,
  addContact,
  searchUser,
  getActionItems,
  searchMessages
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/search", protectRoute, searchUser);
router.post("/add-contact", protectRoute, addContact);
router.get("/recommendations/:id", protectRoute, getAIRecommendations);
router.get("/summary/:id", protectRoute, getChatSummary);
router.get("/action-items/:id", protectRoute, getActionItems);
router.get("/search/:id", protectRoute, searchMessages);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/edit/:id", protectRoute, editMessage);
router.post("/react/:id", protectRoute, reactToMessage);
router.post("/ai", protectRoute, handleAIFeature);
router.post("/seen/:id", protectRoute, markAsSeen);
router.delete("/delete/:id", protectRoute, deleteMessage);

export default router;
