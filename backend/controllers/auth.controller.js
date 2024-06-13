import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

//Sign Up Function
const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body; //taking input form the body. usign middleware in server file

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; //email Regex
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email format" });
    }

    const existingUser = await User.findOne({ username }); //find user form database
    if (existingUser) {
      return res.status(400).json({ error: "User alrady Exist" });
    }

    const existingEmail = await User.findOne({ email }); //find emial form database
    if (existingEmail) {
      return res.status(400).json({ error: "Email alrady Exist" });
    }

    //#hashing the pass
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //create User
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImgL: newUser.coverImg,
      });
    } else {
      console.log(`Error in signup controller funtion =>: ${error.message}`);
      return res.status(400).json({ error: "newUser is not created" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to signup" });
  }
};

//Log In Function
const login = async (req, res) => {
  res.json({
    data: "you are login ",
  });
};

////Log out Function
const logout = async (req, res) => {
  res.json({
    data: "you are logout",
  });
};

export { signup, login, logout };
