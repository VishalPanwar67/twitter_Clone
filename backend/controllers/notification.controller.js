import Notification from "../models/notification.model.js";

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve notifications for the user
    const notifications = await Notification.find({ to: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "from",
        select: "username profileImg",
      });

    // Mark all notifications as read
    const updateResult = await Notification.updateMany(
      { to: userId },
      { read: true }
    );

    // Log the notifications and the result of the update
    // console.log("Notifications fetched:", notifications);
    // console.log("Notifications marked as read:", updateResult);

    res.status(200).json(notifications);
  } catch (error) {
    // Improved error logging
    console.error(`Unable to get notifications: ${error.message}`, {
      stack: error.stack,
    });

    // Detailed error response
    return res.status(500).json({
      error: "Unable to get notifications - Catch Block",
      message: error.message,
    });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log(`Unable to delete notifications: ${error}`);
    return res
      .status(500)
      .json({ error: "Unable to delete notifications - Catch Block" });
  }
};

export { getNotifications, deleteNotifications };
