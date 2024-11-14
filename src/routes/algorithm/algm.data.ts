const weights = {
  partnerFromSameCountry: 0.15, // 15% importance
  wantChildren: 0.15, // 15% importance
  wantMarriage: 0.15, // 15% importance
  educationLevel: 0.2, // 20% importance
  heightPreference: 0.15, // 15% importance
  returnToCountry: 0.1, // 10% importance
  smokingPreference: 0.05, // 5% importance
  physiquePreference: 0.05, // 5% importance
  // Total = 1
};

// Priority 1: Relationship with Someone from Same Country
const partnerFromSameCountryData = {
  "Yes, it's very important to me": {
    scoreIfMatch: 5,
    scoreIfDifferent: 1,
  },
  "Yes, it's preferable but not essential": {
    scoreIfMatch: 4,
    scoreIfDifferent: 2,
  },
  "No, I’m open to people from other countries": {
    scoreIfMatch: 3,
    scoreIfDifferent: 3,
  },
  "I don't mind": {
    scoreIfMatch: 3,
    scoreIfDifferent: 3,
  },
  "No, not at all": {
    scoreIfMatch: 1,
    scoreIfDifferent: 5,
  },
};

// Priority 2: Want Children
const wantChildrenData = {
  Yes: {
    Yes: 5,
    No: 1,
    "Not sure": 3,
  },
  No: {
    Yes: 1,
    No: 5,
    "Not sure": 3,
  },
  "Not sure": {
    Yes: 3,
    No: 3,
    "Not sure": 5,
  },
};

// Priority 3: Want Marriage
const wantMarriageData = {
  "Yes, it's very important to me": {
    "Yes, it's very important to me": 5,
    "Yes, if my partner wants it": 4,
    "No, not really": 1,
    "It doesn't matter": 3,
  },
  "Yes, if my partner wants it": {
    "Yes, it's very important to me": 4,
    "Yes, if my partner wants it": 5,
    "No, not really": 2,
    "It doesn't matter": 3,
  },
  "No, not really": {
    "Yes, it's very important to me": 1,
    "Yes, if my partner wants it": 2,
    "No, not really": 5,
    "It doesn't matter": 3,
  },
  "It doesn't matter": {
    "Yes, it's very important to me": 3,
    "Yes, if my partner wants it": 3,
    "No, not really": 3,
    "It doesn't matter": 5,
  },
};

// Priority 4: Education Level
const educationLevelData = {
  "Primary school": {
    "Primary school": 5,
    "Secondary school": 4,
    "High school diploma": 3,
    "Bachelor’s degree": 2,
    "Master’s degree": 1,
    Doctorate: 1,
    Other: 3,
  },
  "Secondary school": {
    "Primary school": 4,
    "Secondary school": 5,
    "High school diploma": 4,
    "Bachelor’s degree": 3,
    "Master’s degree": 2,
    Doctorate: 1,
    Other: 3,
  },
  "High school diploma": {
    "Primary school": 3,
    "Secondary school": 4,
    "High school diploma": 5,
    "Bachelor’s degree": 4,
    "Master’s degree": 3,
    Doctorate: 2,
    Other: 3,
  },
  "Bachelor’s degree": {
    "Primary school": 2,
    "Secondary school": 3,
    "High school diploma": 4,
    "Bachelor’s degree": 5,
    "Master’s degree": 4,
    Doctorate: 3,
    Other: 3,
  },
  "Master’s degree": {
    "Primary school": 1,
    "Secondary school": 2,
    "High school diploma": 3,
    "Bachelor’s degree": 4,
    "Master’s degree": 5,
    Doctorate: 4,
    Other: 3,
  },
  Doctorate: {
    "Primary school": 1,
    "Secondary school": 1,
    "High school diploma": 2,
    "Bachelor’s degree": 3,
    "Master’s degree": 4,
    Doctorate: 5,
    Other: 3,
  },
  Other: {
    "Primary school": 3,
    "Secondary school": 3,
    "High school diploma": 3,
    "Bachelor’s degree": 3,
    "Master’s degree": 3,
    Doctorate: 3,
    Other: 5,
  },
};

// Priority 5: Height Preference
const heightPreferenceData = {
  withinRange: 5, // Score if height is within the preferred range
  outsideRange: 1, // Score if height is outside the preferred range
};

// Priority 6: Return to Country of Origin
const returnToCountryData = {
  "Yes, it's a goal of mine": {
    "Yes, it's a goal of mine": 5,
    "Yes, maybe, but it depends on circumstances": 4,
    "No, I don't plan to return": 1,
  },
  "Yes, maybe, but it depends on circumstances": {
    "Yes, it's a goal of mine": 4,
    "Yes, maybe, but it depends on circumstances": 5,
    "No, I don't plan to return": 2,
  },
  "No, I don't plan to return": {
    "Yes, it's a goal of mine": 1,
    "Yes, maybe, but it depends on circumstances": 2,
    "No, I don't plan to return": 5,
  },
};

// Priority 7: Smoking Compatibility
const smokingData = {
  Yes: {
    Yes: 5,
    Occasionally: 4,
    No: 3,
  },
  Occasionally: {
    Yes: 4,
    Occasionally: 5,
    No: 3,
  },
  No: {
    Yes: 1,
    Occasionally: 2,
    No: 5,
  },
};

// Priority 8: Physique Preference
const physiqueData = {
  Slim: {
    Slim: 5,
    Muscular: 3,
    Average: 4,
    Overweight: 2,
    Athletic: 3,
    "No preference": 5,
  },
  Muscular: {
    Slim: 3,
    Muscular: 5,
    Average: 4,
    Overweight: 2,
    Athletic: 5,
    "No preference": 5,
  },
  Average: {
    Slim: 4,
    Muscular: 4,
    Average: 5,
    Overweight: 3,
    Athletic: 4,
    "No preference": 5,
  },
  Overweight: {
    Slim: 2,
    Muscular: 2,
    Average: 3,
    Overweight: 5,
    Athletic: 2,
    "No preference": 5,
  },
  Athletic: {
    Slim: 3,
    Muscular: 5,
    Average: 4,
    Overweight: 2,
    Athletic: 5,
    "No preference": 5,
  },
  "No preference": {
    Slim: 5,
    Muscular: 5,
    Average: 5,
    Overweight: 5,
    Athletic: 5,
    "No preference": 5,
  },
};

export {
  weights,
  partnerFromSameCountryData,
  wantChildrenData,
  wantMarriageData,
  educationLevelData,
  heightPreferenceData,
  returnToCountryData,
  smokingData,
  physiqueData,
};

// Define types for each data object
type PartnerFromSameCountryKeys =
  | "Yes, it's very important to me"
  | "Yes, it's preferable but not essential"
  | "No, I’m open to people from other countries"
  | "I don't mind"
  | "No, not at all";

type WantChildrenKeys = "Yes" | "No" | "Not sure";

type WantMarriageKeys =
  | "Yes, it's very important to me"
  | "Yes, if my partner wants it"
  | "No, not really"
  | "It doesn't matter";

type EducationLevelKeys =
  | "Primary school"
  | "Secondary school"
  | "High school diploma"
  | "Bachelor’s degree"
  | "Master’s degree"
  | "Doctorate"
  | "Other";

type ReturnToCountryKeys =
  | "Yes, it's a goal of mine"
  | "Yes, maybe, but it depends on circumstances"
  | "No, I don't plan to return";

type SmokingKeys = "Yes" | "Occasionally" | "No";

type PhysiqueKeys =
  | "Slim"
  | "Muscular"
  | "Average"
  | "Overweight"
  | "Athletic"
  | "No preference";

export {
  PartnerFromSameCountryKeys,
  WantChildrenKeys,
  WantMarriageKeys,
  EducationLevelKeys,
  ReturnToCountryKeys,
  SmokingKeys,
  PhysiqueKeys,
};
