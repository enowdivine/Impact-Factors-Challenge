import mongoose from "mongoose";

const transaction = new mongoose.Schema(
  {
    transactionType: {
      type: String,
    },
    resourceId: {
      type: String,
    },
    userId: {
      type: String,
      required: [true, "userId is reuired"],
    },
    vendorId: {
      type: String,
    },
    transactionId: {
      type: String,
      required: [true, "transactionId is reuired"],
    },
    financialTransId: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, "amount is reuired"],
    },
    revenue: {
      type: Number,
    },
    username: {
      type: String,
      required: [true, "username is reuired"],
    },
    email: {
      type: String,
    },
    phonenumber: {
      type: String,
      required: [true, "phonenumber is reuired"],
    },
    paymentMethod: {
      type: String,
      required: [true, "payment method is reuired"],
    },
    status: {
      type: String,
      required: [true, "status method is reuired"],
    },
    statusCode: {
      type: String,
      required: [true, "statusCode method is reuired"],
    },
    webhook: {
      type: String,
    },
    dateInitiated: {
      type: Date,
    },
    dateConfirmed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transaction);
