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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", team);
