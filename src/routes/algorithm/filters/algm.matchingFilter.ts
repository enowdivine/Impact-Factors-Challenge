import { User } from "../algm.data";

// Weights for each criterion
const weights = {
  country_of_origin: 5,
  want_children: 4,
  want_marriage: 3,
  education_level: 3,
  height: 2,
  return_to_country: 2,
  smoking: 2,
  physique: 1,
};

// Helper function to rank education levels
const educationLevelRank: { [key: string]: number } = {
  "Primary school": 1,
  "Secondary school": 2,
  "High school diploma": 3,
  "Bachelor’s degree": 4,
  "Master’s degree": 5,
  Doctorate: 6,
  Other: 0,
};

// Rank for "Want Children"
const wantChildrenRank: { [key: string]: number } = {
  Yes: 3,
  "Not sure": 2,
  No: 1,
};

// Rank for "Want Marriage"
const wantMarriageRank: { [key: string]: number } = {
  "Yes, it's very important to me": 4,
  "Yes, if my partner wants it": 3,
  "It doesn't matter": 2,
  "No, not really": 1,
};

// Rank for "Return to Country"
const returnToCountryRank: { [key: string]: number } = {
  "No, I don't plan to return": 3,
  "Yes, maybe, but it depends on the circumstances": 2,
  "Yes, it's a goal of mine": 1,
};

// Rank for "Smoking"
const smokingRank: { [key: string]: number } = {
  No: 3,
  Occasionally: 2,
  Yes: 1,
};

// Rank for "Physique"
const physiqueRank: { [key: string]: number } = {
  Athletic: 5,
  Muscular: 4,
  Slim: 3,
  Average: 2,
  Overweight: 1,
  "No preference": 0,
};

// Rank for "Partner From Same Country"
const partnerFromSameCountryRank: { [key: string]: number } = {
  "Yes, it's very important to me": 5,
  "Yes, it's preferable but not essential": 4,
  "I don't mind": 3,
  "No, I’m open to people from other countries": 2,
  "No, not at all": 1,
};

// scoring algorithm
export const calculateMatchingScoresForPool = (
  currentUser: User,
  userPool: User[]
): User[] => {
  // Function to calculate the score for a single user
  const calculateScore = (user: User): number => {
    let score = 0;

    // Criterion 1: Country of Origin
    if (currentUser.partnerFromSameCountry) {
      if (
        partnerFromSameCountryRank[currentUser.partnerFromSameCountry] &&
        user.countryOfOrigin &&
        currentUser.countryOfOrigin &&
        user.countryOfOrigin.name === currentUser.countryOfOrigin.name
      ) {
        score += weights.country_of_origin;
      }
    }

    // Criterion 2: Want Children
    if (user.wantChildren && currentUser.wantChildren) {
      score +=
        wantChildrenRank[user.wantChildren] ===
        wantChildrenRank[currentUser.wantChildren]
          ? weights.want_children
          : 0;
    }

    // Criterion 3: Want Marriage
    if (user.wantMarriage && currentUser.wantMarriage) {
      score +=
        wantMarriageRank[user.wantMarriage] ===
        wantMarriageRank[currentUser.wantMarriage]
          ? weights.want_marriage
          : 0;
    }

    // Criterion 4: Education Level
    if (user.educationLevel && currentUser.educationLevel) {
      score +=
        educationLevelRank[user.educationLevel] >=
        educationLevelRank[currentUser.educationLevel]
          ? weights.education_level
          : 0;
    }

    // Criterion 5: Height Preference
    if (
      user.height &&
      currentUser.partnerHeight &&
      currentUser.partnerHeight.minValue !== undefined &&
      currentUser.partnerHeight.maxValue !== undefined &&
      user.height >= currentUser.partnerHeight.minValue &&
      user.height <= currentUser.partnerHeight.maxValue
    ) {
      score += weights.height;
    }

    // Criterion 6: Return to Country
    if (user.returnToCountry && currentUser.returnToCountry) {
      score +=
        returnToCountryRank[user.returnToCountry] ===
        returnToCountryRank[currentUser.returnToCountry]
          ? weights.return_to_country
          : 0;
    }

    // Criterion 7: Smoking
    if (user.smoking && currentUser.partnerSmoking) {
      score +=
        smokingRank[user.smoking] === smokingRank[currentUser.partnerSmoking]
          ? weights.smoking
          : 0;
    }

    // Criterion 8: Physique
    if (user.physique && currentUser.partnerPhysique) {
      score +=
        physiqueRank[user.physique] ===
        physiqueRank[currentUser.partnerPhysique]
          ? weights.physique
          : 0;
    }

    return score;
  };

  // Calculate scores for all users in the pool
  const scoredUsers = userPool.map((user) => ({
    ...user,
    score: calculateScore(user),
  }));

  // Sort users by score in descending order
  scoredUsers.sort((a, b) => b.score - a.score);

  return scoredUsers;
};
