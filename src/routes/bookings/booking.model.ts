import mongoose from "mongoose";

const booking = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    roomId: {
      type: String,
      default: "",
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    guest: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: Number,
      default: "pending",
    },
    verificationCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", booking);
