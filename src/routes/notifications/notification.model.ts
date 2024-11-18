import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // User who will receive the notification
    },
    type: {
      type: String,
      enum: ["Like", "Message", "Matches", "Security"],
      required: true, // Type of notification
    },
    message: {
      type: String,
      required: true, // Notification message
    },
    icon: {
      type: String,
      required: true, // Icon for the notification
    },
    backgroundColor: {
      type: String,
      required: true, // Background color for the notification
    },
    color: {
      type: String,
      required: true, // Color of the text or icon
    },
    isRead: {
      type: Boolean,
      default: false, // Track whether the notification has been read
    },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

export default mongoose.model("Notification", notificationSchema);
