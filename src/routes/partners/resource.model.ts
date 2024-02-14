import mongoose from "mongoose";

const partner = new mongoose.Schema(
  {
    logo: {
      type: Array,
      default: null,
    },
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

export default mongoose.model("Partners", partner);
