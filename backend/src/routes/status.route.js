import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStatuses, createStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", protectRoute, getStatuses);
router.post("/", protectRoute, createStatus);

export default router;
