import express from "express";
const router = express.Router();

//routes in this same file
router.get("/testEndPoint", (req, res, next) => {
  res.json({
    data: "you are signup",
  });
});

import protectRoute from "../middlewares/protectRoute.js";
import {
  signup,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";

//routes import form the auth file
router.get("/me", protectRoute, getMe); //to get user is loged in or not=> middleware
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
