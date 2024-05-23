import mongoose from "mongoose";
const Schema = mongoose.Schema;

const universitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      stateOrProvince: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      required: false,
    },
    contactInformation: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      bankTransfer: {
        nameOfBank: {
          type: String,
          required: false,
        },
        accountNumber: {
          type: String,
          required: false,
        },
      },
      mobileMoney: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("University", universitySchema);
