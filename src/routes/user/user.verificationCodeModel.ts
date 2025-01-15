import mongoose from "mongoose";

const VerificationCodeSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  code: { type: Number },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires after 5 minutes
});

export default mongoose.model("VerificationCode", VerificationCodeSchema);
