import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["STUDENT", "ADMISSION_OFFICER", "ADMIN"],
      required: true,
    },
    image: { type: String },
    fullName: { type: String, required: true },
    emailAddress: { type: String, unique: true, required: true },
    phoneNumber: { type: String, unique: true },
    authorizationLevel: { type: Number, enum: [1, 2, 3, 4], default: 1 },
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
            required: true,
          },
          link: {
            type: String,
            required: true,
          },
        },
      ],
      // Guardians information
      guardian: {
        guardianName: { type: String },
        guardianEmail: { type: String, unique: true },
        guardianPhone: { type: String, unique: true },
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
