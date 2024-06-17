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

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "password is short=> must have more then 6 " });
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
        coverImg: newUser.coverImg,
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
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }); //find the user from dataBase
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    ); //check the password

    if (!user || !isPasswordCorrect) {
      console.log(`Invalid username or password => ${username}`);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log(`Unable to log in: ${error}`);
    return res.status(500).json({ error: "Unable to log in - Catch Block" });
  }
};

////Log out Function
const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(`Unable to log out: ${error}`);
    return res.status(500).json({ error: "Unable to log out - Catch Block" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(`Unable to get user: ${error}`);
    return res.status(500).json({ error: "Unable to get user - Catch Block" });
  }
};

export { signup, login, logout, getMe };
