import mongoose from "mongoose";

const category = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Faculty", category);
