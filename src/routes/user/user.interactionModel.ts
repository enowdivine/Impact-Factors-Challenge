import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true }, // The user performing the action
    targetUser: { type: String, ref: "User", required: true }, // The user being liked/disliked
    type: {
      type: String,
      enum: ["LIKE", "DISLIKE", "BLOCK", "UNMATCH"],
      required: true,
    }, // Interaction type
  },
  {
    timestamps: true, // Includes `createdAt` and `updatedAt` fields
  }
);

// Indexing
userInteractionSchema.index({ user: 1, targetUser: 1 }, { unique: true }); // Ensure one interaction per pair of users
userInteractionSchema.index({ type: 1 }); // Query by interaction type (like/dislike)
userInteractionSchema.index({ createdAt: 1 }); // Sort by interaction time

export default mongoose.model("UserInteraction", userInteractionSchema);
