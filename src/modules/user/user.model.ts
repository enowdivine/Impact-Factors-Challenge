import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
