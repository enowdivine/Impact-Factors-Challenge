import mongoose from "mongoose";
const Schema = mongoose.Schema;

const supportSchema = new Schema(
  {
    userId: { type: String, ref: "User", required: true },
    reasons: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "RESOLVED"],
      required: true,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Support", supportSchema);
