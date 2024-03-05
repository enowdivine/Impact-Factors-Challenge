import mongoose from "mongoose";

const event = new mongoose.Schema(
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
    category: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: null,
    },
    link: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", event);
