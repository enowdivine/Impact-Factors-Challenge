import mongoose from "mongoose";

const userMatchSchema = new mongoose.Schema(
  {
    user1: { type: String, ref: "User", required: true },
    user2: { type: String, ref: "User", required: true },
    score: { type: Number, required: true },
    user1Liked: { type: Boolean, default: false },
    user2Liked: { type: Boolean, default: false },
    isMutual: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexing
userMatchSchema.index({ user1: 1 });
userMatchSchema.index({ user2: 1 });
userMatchSchema.index({ user1: 1, user2: 1 }, { unique: true }); // Unique compound index for efficient lookups between two users
userMatchSchema.index({ score: -1 }); // Index for sorting by score in descending order
userMatchSchema.index({ timestamp: -1 }); // Index for queries based on the timestamp
userMatchSchema.index({ isMutual: 1 }); // Index for filtering mutual matches
userMatchSchema.index({ user1Liked: 1, user2Liked: 1 }); // Compound index for filtering based on like status
userMatchSchema.index({ user1: 1, score: -1 }); // Index for efficient queries involving user1 and score sorting
userMatchSchema.index({ user2: 1, score: -1 }); // Index for efficient queries involving user2 and score sorting

export default mongoose.model("UserMatch", userMatchSchema);
