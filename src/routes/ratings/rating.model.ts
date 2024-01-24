import mongoose from "mongoose";

const rating = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: [true, "roomId is required"],
    },
    username: {
      type: String,
      required: [true, "username is required"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
    },
    comment: {
      type: String,
      required: [true, "comment is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Rating", rating);
