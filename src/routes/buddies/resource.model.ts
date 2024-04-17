import mongoose from "mongoose";

const Buddy = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    campus: {
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

export default mongoose.model("Buddies", Buddy);
