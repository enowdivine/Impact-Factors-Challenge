import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
      default: "USER",
    },
    picture: { type: String },
    fullName: { type: String, required: true },
    emailAddress: { type: String, unique: true, required: true },
    phoneNumber: { type: Number, unique: true, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
