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
    picture: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: Number, unique: true, required: true },
    password: { type: String, required: true },
    //
    location: { type: String },
    likedUsers: [String],
    premium: {
      isPremium: { type: Boolean, required: true },
      plan: { type: String, required: true },
      expiresIn: { type: Date },
    },
    //
    gender: {
      type: String,
      enum: ["MAN", "WOMAN"],
    },
    interestedGender: { type: String },
    age: { type: Number },
    countryOfOrigin: { type: String },
    currentCountry: { type: String },
    maritalStatus: { type: String },
    numberOfChildren: { type: Number },
    size: { type: Number },
    //
    physique: { type: String },
    interests: [String],
    practicedSports: [String],
    religion: { type: String },
    importanceOfReligion: { type: String },
    drinkAlcohol: { type: Boolean, enum: ["YES", "NO"] },
    smoke: { type: Boolean, enum: ["YES", "NO"] },
    //
    educationLevel: { type: String },
    workSector: [String],
    languages: [String],
    personality: [String],
    lifeImportance: [String],
    values: [String],
    //
    willLikeToGetMarried: { type: Boolean, enum: ["YES", "NO"] },
    relationshipEssentials: [String],
    willLikeToHaveChildren: { type: Boolean, enum: ["YES", "NO"] },
    planOnReturningToMyCountry: { type: Boolean, enum: ["YES", "NO"] },
    importanceOfValues: { type: String },
    partnerFromOtherBackground: {
      type: Boolean,
      enum: ["YES", "NO"],
    },
    partnerFromSameCountry: {
      type: Boolean,
      enum: ["YES", "NO"],
    },
    partnerInSameCountry: {
      type: Boolean,
      enum: ["YES", "NO"],
    },
    //
    shareHouseTasks: {
      type: Boolean,
      enum: ["YES", "NO"],
    },
    longTermCountry: { type: String },
    oftenCook: { type: String },
    importanceToSexuality: { type: String },
    //
    partnerFinancialStability: { type: String },
    partnerAge: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
    partnerEducationLevel: { type: String },
    partnerInterest: [String],
    partnerCharacteristics: [String],
    partnerCanSmoke: {
      type: Boolean,
      enum: ["YES", "NO"],
    },
    partnerHeight: {
      minValue: { type: Number },
      maxValue: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
