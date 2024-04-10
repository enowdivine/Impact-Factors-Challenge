import mongoose from "mongoose";

const course = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    programType: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    fee: {
      type: String,
      default: "",
    },
    courseType: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
    startMonth: {
      type: String,
      default: "",
    },
    campuses: {
      type: Array,
      default: [],
    },
    lecturers: {
      type: Array,
      default: [],
    },
    content: {
      type: String,
      default: "",
    },
    prospectus: {
      type: String,
      default: "",
    },
    admissionRequirements: {
      type: String,
      default: "",
    },
    feeDetails: {
      type: String,
      default: "",
    },
    scholarship: {
      type: String,
      default: "",
    },
    applicationProcess: {
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

export default mongoose.model("Course", course);
