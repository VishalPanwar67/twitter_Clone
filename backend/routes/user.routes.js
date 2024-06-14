import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();

import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUser,
  updateUserProfile,
} from "../controllers/user.controller.js";

router.get("/profile/:username", protectRoute, getUserProfile); //get user profile
router.post("/follow/:id", protectRoute, followUnfollowUser); //follow or unfollow user
router.get("/suggested", protectRoute, getSuggestedUser); //get user profile
router.post("/update", protectRoute, updateUserProfile);//update user profile

export default router;
