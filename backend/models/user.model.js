import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowecase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId, // taking the followers form the User model
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId, // taking the following form the User model
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    //refreshToken: {
    // type: String,
    //},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
