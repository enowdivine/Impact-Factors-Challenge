import mongoose from "mongoose";

const testimonial = new mongoose.Schema(
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
    school: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Testimonial", testimonial);
