import mongoose from "mongoose";

const UserDailyMatchSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", unique: true },
    date: { type: String }, // Format: YYYY-MM-DD
    matches: [{ type: String, ref: "User" }], // Store IDs of matches
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserDailyMatch", UserDailyMatchSchema);
