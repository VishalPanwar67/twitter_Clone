import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();

import {
  getNotifications,
  deleteNotifications,
} from "../controllers/notification.controller.js";

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);

export default router;
