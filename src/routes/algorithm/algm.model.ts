import mongoose from "mongoose";

const scoreUserSchema = new mongoose.Schema(
  {
    user1: { type: String, ref: "User", required: true },
    user2: { type: String, ref: "User", required: true },
    score: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexing
scoreUserSchema.index({ user1: 1 });
scoreUserSchema.index({ user2: 1 });
scoreUserSchema.index({ user1: 1, user2: 1 }, { unique: true }); // Unique compound index for efficient lookups between two users
scoreUserSchema.index({ score: -1 }); // Index for sorting by score in descending order
scoreUserSchema.index({ timestamp: -1 }); // Index for queries based on the timestamp
scoreUserSchema.index({ user1: 1, score: -1 }); // Index for efficient queries involving user1 and score sorting
scoreUserSchema.index({ user2: 1, score: -1 }); // Index for efficient queries involving user2 and score sorting

export default mongoose.model("ScoredUser", scoreUserSchema);
