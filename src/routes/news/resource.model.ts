import mongoose from "mongoose";

const news = new mongoose.Schema(
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
    desc: {
      type: String,
      default: "",
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

export default mongoose.model("News", news);
