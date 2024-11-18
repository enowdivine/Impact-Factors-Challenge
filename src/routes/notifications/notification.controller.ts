import { Request, Response } from "express";
import User from "../user/user.model";
import NotificationModel from "../notifications/notification.model";

class NotificationController {
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.params.id; // The ID of the user
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Calculate the skip value for pagination
      const skip = (page - 1) * limit;

      // Query the NotificationModel to get notifications for the user
      const notifications = await NotificationModel.find({ userId })
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip(skip)
        .limit(limit);

      // Get the total count of notifications for the user
      const totalNotifications = await NotificationModel.countDocuments({
        userId,
      });

      return res.status(200).json({
        notifications,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching notifications",
      });
    }
  }

  async generateNotifications(req: Request, res: Response) {
    try {
      const users = await User.find(); // Fetch all users from the database

      const notificationTypes = [
        {
          type: "Like",
          message: "Someone liked your profile",
          icon: "heart",
          backgroundColor: "#FF3D3D1C",
          color: "#FF3425",
        },
        {
          type: "Message",
          message: "You have a new message",
          icon: "chatbubble",
          backgroundColor: "#C6F9F4",
          color: "#10C0BA",
        },
        {
          type: "Matches",
          message: "It's a match!",
          icon: "podium",
          backgroundColor: "#B8E7FE",
          color: "#00C2FF",
        },
        {
          type: "Security",
          message: "Your password has been updated",
          icon: "lock-closed",
          backgroundColor: "#E0E0E0",
          color: "#7A7A7A",
        },
      ];

      // Loop through each user and generate 100 notifications
      for (const user of users) {
        const notifications = [];

        for (let i = 0; i < 100; i++) {
          const randomType =
            notificationTypes[
              Math.floor(Math.random() * notificationTypes.length)
            ];

          notifications.push({
            userId: user._id,
            type: randomType.type,
            message: randomType.message,
            icon: randomType.icon,
            backgroundColor: randomType.backgroundColor,
            color: randomType.color,
          });
        }

        // Insert all notifications into the database
        await NotificationModel.insertMany(notifications);
      }

      return res.status(200).json({
        message: "100 notifications generated for each user successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error generating notifications",
      });
    }
  }
}

export default NotificationController;
