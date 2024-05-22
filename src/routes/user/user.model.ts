import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Subdocument schema for documents
const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { _id: false }
); // Setting _id to false to avoid creating separate IDs for each subdocument

const user = new Schema(
  {
    role: {
      type: String,
      enum: ["STUDENT", "ADMISSION_OFFICERS", "ADMIN"],
      required: true,
    },
    fullName: { type: String, required: true },
    emailAddress: { type: String, unique: true, required: true },
    phoneNumber: { type: String, unique: true },
    password: { type: String, required: true },

    // Common fields for Students
    studentDetails: {
      amsId: { type: String },
      ordinaryLevelIdentificationNumber: { type: String },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
      address: { type: String },
      highSchoolName: { type: String },
      gradesGPA: { type: String },
      documents: [documentSchema],
      authorizationLevel: { type: Number, enum: [1, 2, 3, 4], default: 4 },
    },

    // Common fields for Admission Officers
    admissionOfficerDetails: {
      assignedUniversities: [String], // Array of university names/IDs
      authorizationLevel: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    },

    // Common fields for Administrators
    administratorDetails: {
      authorizationLevel: { type: Number, enum: [1, 2, 3, 4], default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", user);
