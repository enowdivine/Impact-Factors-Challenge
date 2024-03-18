import mongoose from "mongoose";

const program = new mongoose.Schema(
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
    // campusID: {
    //   type: Array,
    //   default: [],
    // },
    summary: {
      type: String,
      default: "",
    },
    otherDetails: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Program", program);
