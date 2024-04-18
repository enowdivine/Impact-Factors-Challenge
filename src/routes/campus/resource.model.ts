import mongoose from "mongoose";

const campus = new mongoose.Schema(
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
    summary: {
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

export default mongoose.model("Campus", campus);
