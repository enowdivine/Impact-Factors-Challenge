import mongoose from "mongoose";
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["ADMIN", "SUPERADMIN"],
      required: true,
      default: "ADMIN",
    },
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
      required: true,
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
