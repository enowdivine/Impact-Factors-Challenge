import mongoose from "mongoose";

const team = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    name: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    profession: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    isManagement: {
      type: Boolean,
      default: false,
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

export default mongoose.model("Team", team);
