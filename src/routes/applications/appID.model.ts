import mongoose from "mongoose";
const Schema = mongoose.Schema;

const counterSchema = new Schema(
  {
    abbreviation: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
