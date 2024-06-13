import express from "express";
const router = express.Router();

//routes in this same file
router.get("/signup", (req, res, next) => {
    res.json({
        data: "you are signup",
    })
})

import { login, logout } from "../controllers/auth.controller.js";

//routes import form the auth file
router.get("/login", login)
router.get("/logout", logout)

export default router;