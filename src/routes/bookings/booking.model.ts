import mongoose from "mongoose";

const booking = new mongoose.Schema(
  {
    bookingType: {
      type: String,
    },
    username: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    roomId: {
      type: String,
    },
    checkInDate: {
      type: Date,
    },
    checkInTime: {
      type: String,
    },
    checkOutDate: {
      type: Date,
    },
    checkOutTime: {
      type: String,
    },
    guestAdults: {
      type: Number,
    },
    guestKids: {
      type: Number,
    },
    //
    groupName: {
      type: String,
    },
    numberofDelegates: {
      type: Number,
    },
    mealOption: {
      type: String,
    },
    //
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
