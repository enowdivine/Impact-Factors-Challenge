import mongoose from "mongoose";
const Schema = mongoose.Schema;

const applicationSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    programId: {
      type: String,
      required: true,
    },
    universityId: {
      type: String,
      required: true,
    },
    programName: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    documents: [
      {
        title: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Applications", applicationSchema);
