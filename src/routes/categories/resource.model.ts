import mongoose from "mongoose";

const category = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    programmeID: {
      type: Array,
      default: [],
    },
    // campusID: {
    //   type: String,
    //   default: "",
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", category);
