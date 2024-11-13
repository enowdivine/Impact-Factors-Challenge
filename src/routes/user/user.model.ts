import mongoose, { STATES } from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
      default: "USER",
    },
    profilePicture: {
      type: Object,
      default: {},
    },
    images: [],
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    emailVerified: { type: Boolean, default: false },
    profilePrivacy: { type: Boolean, default: false },
    password: { type: String, required: true },
    isProfileCompleted: { type: Boolean, default: false },
    //
    questionOne: { type: String },
    answerOne: { type: String },
    questionTwo: { type: String },
    answerTwo: { type: String },
    bio: { type: String },
    //
    location: { type: String },
    likedUsers: [String],
    dislikedUsers: [String],
    premium: {
      isPremium: { type: Boolean, default: false },
      plan: { type: String, default: "FREE" },
      expiresIn: { type: Date },
    },
    //
    gender: { type: String },
    interestedGender: { type: String },
    age: { type: Number },
    countryOfOrigin: {
      type: Object,
      default: {},
    },
    currentLocation: {
      type: Object,
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
      },
      city: { type: String },
      region: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    maritalStatus: { type: String },
    numberOfChildren: { type: String },
    height: { type: Number },
    //
    physique: { type: String },
    interests: [String],
    practicedSports: [String],
    religion: { type: String },
    importanceOfReligion: { type: String },
    smoking: { type: String },
    //
    educationLevel: { type: String },
    occupation: { type: String },
    languages: [String],
    personality: [String],
    importantInLife: [String],
    values: [String],
    //
    wantMarriage: { type: String },
    relationshipEssentials: [String],
    wantChildren: { type: String },
    returnToCountry: { type: String },
    culturalValuesImportance: { type: String },
    partnerFromOtherBackground: { type: String },
    partnerFromSameCountry: { type: String },
    partnerInSameCountry: { type: String },
    //
    shareHouseholdTasks: { type: String },
    longTermCountries: [],
    //
    partnerAge: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
    partnerEducationLevel: { type: String },
    partnerAttraction: [String],
    partnerPhysique: { type: String },
    partnerSmoking: { type: String },
    partnerHeight: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
    //
    //
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN"],
      required: true,
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ currentLocation: "2dsphere" });
userSchema.index({ gender: 1 });
userSchema.index({ interestedGender: 1 });
userSchema.index({ "currentLocation.coordinates": "2dsphere" });
userSchema.index({ score: -1 });

export default mongoose.model("User", userSchema);
