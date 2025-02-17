import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    profilePicture: {
      type: Object,
      default: {},
    },
    images: [
      {
        url: { type: String, trim: true },
        key: { type: String, trim: true },
      },
    ],
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
    likesToday: {
      count: { type: Number, default: 0 },
      resetAt: { type: Date },
    },
    premium: {
      isPremium: { type: Boolean, default: false },
      stripeCustomerId: { type: String },
    },
    //
    gender: { type: String },
    interestedGender: { type: String },
    age: { type: Number },
    countryOfOrigin: {
      type: Object,
      default: {},
    },
    coordinates: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },

    currentLocation: {
      type: Object,
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
      minValue: { type: Number, default: 18 },
      maxValue: { type: Number, default: 100 },
    },
    partnerEducationLevel: { type: String },
    partnerAttraction: [String],
    partnerPhysique: { type: String },
    partnerSmoking: { type: String },
    partnerHeight: {
      minValue: { type: Number, default: 0 },
      maxValue: { type: Number, default: 250 },
    },
    //
    notificationToken: { type: String },
    emailNotification: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "SUSPENDED", "DEACTIVATED"],
      required: true,
      default: "ACTIVE",
    },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexing
userSchema.index({ email: 1 }, { unique: true }); // Ensure unique emails
userSchema.index({ coordinates: "2dsphere" }); // Geospatial index
userSchema.index({ gender: 1 }); // Index for gender filter
userSchema.index({ interestedGender: 1 }); // Index for interestedGender filter
userSchema.index({ age: 1 }); // Index for age range queries
userSchema.index({ status: 1 }); // Index for status filter
userSchema.index({ updatedAt: 1 }); // Index for efficient updatedAt filtering
userSchema.index({ createdAt: 1 }); // Index for queries based on user creation time
userSchema.index({ "premium.isPremium": 1 }); // Index for premium users filter
userSchema.index({ countryOfOrigin: 1 }); // Index for country of origin queries

// Compound Indexes
userSchema.index({ gender: 1, interestedGender: 1, status: 1 }); // Compound index for common gender and status queries
userSchema.index({ age: 1, status: 1 }); // Compound index for age and status queries
userSchema.index({ coordinates: "2dsphere", status: 1 }); // Geospatial index combined with status
userSchema.index({ updatedAt: 1, status: 1 }); // Compound index for updated users and status

export default mongoose.model("User", userSchema);
