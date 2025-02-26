import mongoose from "mongoose";

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN"], // ✅ Supports both SuperAdmin & Church Admin
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
    churchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
