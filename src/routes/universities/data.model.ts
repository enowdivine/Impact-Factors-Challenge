import mongoose from "mongoose";
const Schema = mongoose.Schema;

const universitySchema = new Schema(
  {
    image: {
      type: String,
      default: null,
    },
    letterHead: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    abbreviation: {
      type: String,
      required: true,
      maxlength: 3,
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
        default: "Cameroon",
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
        type: Number,
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
        type: Number,
        required: false,
      },
    },
    signatory: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("University", universitySchema);
