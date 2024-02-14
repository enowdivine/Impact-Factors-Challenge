import mongoose from "mongoose";

const event = new mongoose.Schema(
  {
    image: {
      type: Array,
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    category: {
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

export default mongoose.model("Event", event);
