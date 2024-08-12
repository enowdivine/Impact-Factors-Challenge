import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: [
        "STUDENT",
        "COUNSELLOR",
        "AECO_ADMIN",
        "ADMISSION_OFFICER",
        "ADMIN",
      ],
      required: true,
    },
    image: { type: String },
    fullName: { type: String, required: true },
    emailAddress: { type: String, unique: true, required: true },
    phoneNumber: { type: Number, unique: true, required: true },
    nationalIDNumber: { type: String },
    citizenship: { type: String, default: "Cameroonian" },
    authorizationLevel: { type: Number, enum: [1, 2, 3], default: null },
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
      documents: [
        {
          title: {
            type: String,
          },
          link: {
            type: String,
          },
        },
      ],
      // Guardians information
      guardian: {
        guardianName: { type: String },
        guardianEmail: { type: String, unique: true },
        guardianPhone: { type: Number, unique: true },
        guardianAge: { type: Number },
        guardianAddress: { type: String },
      },
    },

    // Common fields for Admission Officers
    admissionOfficerDetails: {
      assignedUniversities: [String], // Array of university names/IDs
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
