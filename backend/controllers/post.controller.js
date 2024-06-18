import { User, Post } from "../models/index.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    let { img } = req.body;

    const userId = req.user._id.toString();

    // Fetch the user making the request
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure at least one of text or image is provided
    if (!text && !img) {
      return res.status(400).json({ error: "Please add text or image" });
    }

    // Handle image upload if an image is provided
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    // Create the new post
    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    // Save the new post to the database
    await newPost.save();

    // Respond with the created post
    return res.status(200).json(newPost);
  } catch (error) {
    console.error(`Unable to create post: ${error}`);
    return res.status(500).json({ error: "Unable to create post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Post.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Post deleted successfully", post: post });
  } catch (error) {
    console.log(`Unable to delete post: ${error}`);
    return res.status(500).json({ error: "Unable to delete post" });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Please add text" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    // Populate the user field in comments
    const populatedPost = await Post.findById(postId).populate(
      "comments.user",
      "username"
    );

    const postComments = populatedPost.comments.map((comment) => ({
      user: {
        _id: comment.user._id,
        username: comment.user.username,
      },
      text: comment.text,
      createdAt: comment.createdAt,
    }));

    return res.status(200).json(postComments);
  } catch (error) {
    console.error(`Unable to comment on post: ${error}`);
    return res.status(500).json({ error: "Unable to comment on post" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      // Unlike the post
      // post.likes.pull(userId); // Update the post object locally to reflect changes
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updateLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      // await post.save();
      return res.status(200).json(updateLikes);
    } else {
      // Like the post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      // Add notification
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();
      const updateLikes = post.likes;
      return res.status(200).json(updateLikes);
    }
  } catch (error) {
    console.error(`Unable to like/unlike post: ${error}`);
    return res.status(500).json({ error: "Unable to like/unlike post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log(`Unable to get posts: ${error}`);
    return res.status(500).json({ error: "Unable to get posts" });
  }
};

const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Unable to get liked posts: ${error}`);
    return res.status(500).json({ error: "Unable to get liked posts" });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log(`Unable to get following posts: ${error}`);
    return res.status(500).json({ error: "Unable to get following posts" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(posts);
  } catch (error) {
    console.log(`Unable to get user posts: ${error}`);
    return res.status(500).json({ error: "Unable to get user posts" });
  }
};

export {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
};
