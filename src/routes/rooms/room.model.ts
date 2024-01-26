import mongoose from "mongoose";

const room = new mongoose.Schema(
  {
    images: {
      type: Array,
      default: [],
    },
    title: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      default: 0,
    },
    size: {
      type: String,
      default: "",
    },
    capacity: {
      type: String,
      default: "",
    },
    bed: {
      type: String,
    },
    services: {
      type: Array,
      dafault: [],
    },
    desc: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", room);
