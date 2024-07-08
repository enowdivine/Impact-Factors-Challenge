import mongoose from "mongoose";
const Schema = mongoose.Schema;

const programSchema = new Schema(
  {
    universityId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    awardingBody: {
      type: String,
      required: true,
    },
    tuitionFee: {
      type: String,
      required: true,
    },
    initialDeposit: {
      type: String,
      required: true,
    },
    otherFees: {
      type: String,
      required: true,
    },
    teachingMode: {
      type: String,
      required: true,
    },
    teachingMethods: {
      type: String,
      required: true,
    },
    mediumOfInstruction: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    levelOfStudy: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    duration: {
      type: String, // Could be "4 years", "8 semesters", etc.
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    admissionRequirements: [
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
    conditionsForAcceptance: [
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

export default mongoose.model("Program", programSchema);
