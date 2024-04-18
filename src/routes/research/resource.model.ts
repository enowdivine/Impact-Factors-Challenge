import mongoose from "mongoose";

const research = new mongoose.Schema(
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
    summary: {
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
    isFrench: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Research", research);
