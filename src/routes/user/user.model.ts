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
    picture: {
      key: { type: String },
      url: { type: String },
    },
    images: [{ url: { type: String }, key: { type: String } }],
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    emailVerified: { type: Boolean, default: false },
    profilePrivacy: { type: Boolean, default: false },
    password: { type: String, required: true },
    //
    questionOne: { type: String },
    answerOne: { type: String },
    questionTwo: { type: String },
    answerTwo: { type: String },
    //
    location: { type: String },
    likedUsers: [String],
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
    currentCountry: {
      type: Object,
      default: {},
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
    partnerPhysique: [String],
    partnerSmoking: { type: String },
    partnerHeight: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
    partnerRange: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
