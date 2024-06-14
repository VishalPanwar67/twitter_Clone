import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
//models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log(`Unable to get user Profile: ${error}`);
    return res
      .status(500)
      .json({ error: "Unable to get user Profile - Catch Block" });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }
    if (!userToModify && !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(
        id,
        { $pull: { followers: req.user._id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: id } },
        { new: true }
      );
      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      //follow
      await User.findByIdAndUpdate(
        id,
        { $push: { followers: req.user._id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { following: id } },
        { new: true }
      );

      //send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();
      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.log(`Unable to follow or unfollow user: ${error}`);
    return res
      .status(500)
      .json({ error: "Unable to follow or unfollow user - Catch Block" });
  }
};

const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter((user) => {
      return !userFollowedByMe.following
        .map(String)
        .includes(user._id.toString());
    });
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      user.password = null;
    });
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(`Unable to get suggested user: ${error}`);
    res.status(500).json({ error: "Unable to get suggested user" });
  }
};

const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    // check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // check if current password is correct
    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please enter both current and new password" });
    }
    // if current password is correct
    if (newPassword && currentPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword === currentPassword) {
        return res.status(400).json({
          error: "New password must be different from current password",
        });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    // update profile image and cover image with cloudinary
    if (profileImg) {
      if (user.profileImg) {
        const imageId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        const imageId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(`Unable to update user profile: ${error}`);
    res.status(500).json({ error: "Unable to update user profile" });
  }
};

export {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUser,
  updateUserProfile,
};
