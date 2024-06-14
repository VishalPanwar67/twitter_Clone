import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; //get token from cookie
    if (!token) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verify token
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password"); //get user from database
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; //set user in req
    next();
  } catch (error) {
    console.log(`Error in protectRoute middleware: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;
