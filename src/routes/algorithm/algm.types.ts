export interface Premium {
  isPremium: boolean;
  plan: string;
  expiresIn?: Date;
}

export interface PartnerAge {
  minValue?: number;
  maxValue?: number;
}

export interface PartnerHeight {
  minValue?: number;
  maxValue?: number;
}

export interface PartnerRange {
  minValue?: number;
  maxValue?: number;
}

export interface LocationObject {
  status?: string;
  message?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export interface UserImage {
  url?: string;
  key?: string;
}

export interface User {
  // id?: string;
  role?: "ADMIN" | "USER";

  profilePicture?: UserImage;
  images?: UserImage[];

  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  password?: string;
  isProfileCompleted?: boolean;
  //
  profilePrivacy?: boolean;
  questionOne?: string;
  answerOne?: string;
  questionTwo?: string;
  answerTwo?: string;
  bio?: string;
  //
  location?: string;
  likedUsers?: string[];
  dislikedUsers?: string[];
  premium?: Premium;
  gender?: string;
  interestedGender?: string;
  age?: number;
  countryOfOrigin?: any;
  coordinates?: number[];
  currentLocation?: LocationObject;
  maritalStatus?: string;
  numberOfChildren?: string;
  height?: number;
  physique?: string;
  interests?: string[];
  practicedSports?: string[];
  religion?: string;
  importanceOfReligion?: string;
  smoking?: string;
  educationLevel?: string;
  occupation?: string;
  languages?: string[];
  personality?: string[];
  importantInLife?: string[];
  values?: string[];
  wantMarriage?: string;
  relationshipEssentials?: string[];
  wantChildren?: string;
  returnToCountry?: string;
  culturalValuesImportance?: string;
  partnerFromOtherBackground?: string;
  partnerFromSameCountry?: string;
  partnerInSameCountry?: string;
  shareHouseholdTasks?: string;
  longTermCountries?: any[];
  partnerAge?: PartnerAge;
  partnerEducationLevel?: string;
  partnerAttraction?: string[];
  partnerPhysique?: string;
  partnerSmoking?: string;
  partnerHeight?: PartnerHeight;
  //
  status?: string;
}

export const QUESTIONS = {
  gender: ["MAN", "WOMAN"],
  interestedGender: ["MAN", "WOMAN"],
  age: { min: 18, max: 99 },
  countryOfOrigin: [], // Suggest countries based on input
  currentLocation: [], // Suggest countries based on input
  maritalStatus: ["Single", "Widowed", "Divorced"],
  children: [
    "None",
    "1 child",
    "2 children",
    "3 children",
    "More than 3 children",
  ],
  height: { min: 80, max: 240 }, // In cm
  physique: ["Slim", "Muscular", "Average", "Overweight", "Athletic"],
  interests: [
    "Sports",
    "Carpentry",
    "Dance",
    "Theater",
    "Reading",
    "Photography",
    "Cinema",
    "Art",
    "Music",
    "Cooking",
    "Video games",
    "Architecture",
    "Travel",
    "Youtube",
    "Craftsmanship",
    "None",
  ],
  sports: [
    "Tennis",
    "Rugby",
    "Badminton",
    "Jogging",
    "Hockey",
    "Handball",
    "Basketball",
    "Boxing",
    "Surfing",
    "Table tennis",
    "Skiing",
    "Football",
    "Hiking",
    "Wrestling",
    "Volleyball",
    "Swimming",
    "Skateboarding",
    "Cycling",
    "None",
  ],
  religion: [
    "Agnostic",
    "Christian - Catholic",
    "Christian – Orthodox",
    "Christian – Protestant",
    "Buddhist",
    "Jewish",
    "Spiritual",
    "Atheist",
    "Hindu",
    "Christian",
    "Muslim",
    "Other",
  ],
  religionImportance: [
    "Very important",
    "Important",
    "Slightly important",
    "Not important",
  ],
  smoking: ["Yes", "Occasionally", "No"],
  educationLevel: [
    "Primary school",
    "Secondary school",
    "High school diploma",
    "Bachelor’s degree",
    "Master’s degree",
    "Doctorate",
    "Other",
  ],
  occupation: "", // Open-ended
  languagesSpoken: [
    "English",
    "French",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Russian",
    "Chinese (Mandarin)",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Bengali",
    "Turkish",
    "Vietnamese",
    "Polish",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Greek",
    "Thai",
    "Indonesian",
    "Swahili",
    "Hausa",
    "Amharic",
    "Yoruba",
    "Igbo",
    "Other",
  ],
  personalityTraits: [
    "Friendly",
    "Humorous",
    "Shy",
    "Open",
    "Creative",
    "Adventurous",
    "Patient",
    "Determined",
    "Empathetic",
    "Persistent",
    "Reliable",
    "Optimistic",
    "Calm",
    "Athletic",
    "Competitive",
    "Caring",
    "Idealistic",
    "Organized",
    "Sociable",
    "Independent",
    "Responsible",
    "Romantic",
  ],
  importantInLife: [
    "Health and well-being",
    "Professional success",
    "True friendship",
    "Happiness in love",
    "Peace and satisfaction",
    "Safety and stability",
    "A family home with a partner",
    "Personal growth",
  ],
  values: [
    "Ambition",
    "Freedom",
    "Gratitude",
    "Security-oriented",
    "Loyalty",
    "Idealism",
    "Altruism",
    "Honesty",
    "Respect",
    "Responsibility",
    "Integrity",
    "Justice",
    "Generosity",
    "Family",
    "Empathy",
    "Compassion",
  ],
  wantMarriage: [
    "Yes, it's very important to me",
    "Yes, if my partner wants it",
    "No, not really",
    "It doesn't matter",
  ],
  relationshipEssentials: [
    "Love and affection",
    "Tolerance",
    "Communication",
    "Mutual trust and honesty",
    "Sharing interests",
    "Supporting each other",
    "Mutual fidelity",
    "Building our financial future",
    "Having similar values",
    "Affection and sex",
  ],
  wantChildren: ["Yes", "No", "Not sure"],
  returnToCountry: [
    "Yes, it's a goal of mine",
    "Yes, maybe, but it depends on the circumstances",
    "No, I don't plan to return",
  ],
  culturalValuesImportance: [
    "Very important",
    "Important",
    "Slightly important",
    "Not important",
  ],
  partnerFromOtherBackground: [
    "Very open",
    "Fairly open",
    "Slightly hesitant",
    "Not open",
  ],
  partnerFromSameCountry: [
    "Yes, it's very important to me",
    "Yes, it's preferable but not essential",
    "No, I’m open to people from other countries",
    "I don't mind",
    "No, not at all",
  ],
  partnerInSameCountry: [
    "Yes, my partner must live in the same country",
    "Distance doesn't matter",
    "My partner can live in a neighboring country",
    "My partner can live in another country",
  ],
  shareHouseholdTasks: [
    "Traditional division of roles",
    "Equal division of tasks",
    "Flexible division based on needs",
  ],
  longTermCountry: "",
  partnerAge: { min: 18, max: 100 },
  partnerEducationLevel: [
    "Primary school",
    "Secondary school",
    "High school diploma",
    "Bachelor’s degree",
    "Master’s degree",
    "Doctorate",
    "Other / Doesn't matter",
  ],
  partnerAttraction: [
    "Intelligence",
    "Kindness and compassion",
    "Sense of humor",
    "Self-confidence",
    "Ambition and motivation",
    "Independence",
    "Family values",
    "Loyalty",
  ],
  partnerPhysique: [
    "Slim",
    "Muscular",
    "Average",
    "Stocky",
    "Athletic",
    "No preference",
  ],
  partnerHeight: { min: 50, max: 250 }, // In cm
  partnerSmoking: ["Yes", "Occasionally", "No"],
  optionQuestions: [
    "The vacation I'll never forget:",
    "My idea for a first date:",
    "A strange habit I have:",
    "A perfect day for me is…",
    "As a child, I was convinced that…",
    "One of my positive qualities:",
    "Early bird or not a morning person?",
    "Here’s how I would describe my appearance:",
    "I can’t live without this:",
    "When I have nothing to do, I…",
    "When I’m in a bad mood…",
    "To cheer myself up…",
    "I should do this more often:",
    "This makes me laugh:",
    "I wish I could…",
    "I would never…",
    "I can’t stand at all:",
    "Things I can’t live without:",
    "I’m grateful for…",
    "Three things that matter to me:",
    "The biggest challenge I’ve ever faced:",
    "My hidden talent:",
    "If I could live anywhere in the world, it would be...",
    "The best advice I’ve ever received:",
    "My guilty pleasure:",
    "The book or movie that impacted me the most:",
    "If I could turn back time, I would choose to…",
    "What I love to do in my free time:",
    "The dish I could eat every day without getting tired of it:",
    "My childhood dream was to…",
  ],
};
