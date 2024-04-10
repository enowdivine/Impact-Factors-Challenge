import mongoose from "mongoose";

const category = new mongoose.Schema(
  {
    image: {
      type: String,
    },
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
    isFrench: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Faculty", category);
