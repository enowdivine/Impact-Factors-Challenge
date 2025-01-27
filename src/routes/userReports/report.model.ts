import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    currentUser: { type: String, ref: "User", required: true },
    targetUser: { type: String, ref: "User", required: true },
    reasons: [String],
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "RESOLVED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", reportSchema);
