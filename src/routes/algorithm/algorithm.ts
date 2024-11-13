import User from "../user/user.model";
import {
  weights,
  educationLevelRank,
  wantChildrenRank,
  wantMarriageRank,
  returnToCountryRank,
  smokingRank,
  physiqueRank,
  partnerFromSameCountryRank,
} from "./algm.data";

// Function to calculate a reduced score for criteria based on the difference in ranksconst calculateReducedScore = (
const calculateReducedScore = (
  currentUserRank: number,
  otherUserRank: number,
  weight: number,
  rankData: { [key: string]: number }
): number => {
  const rankDifference = Math.abs(currentUserRank - otherUserRank);
  const maxRankDifference = Math.max(...Object.values(rankData)) - 1;
  const scoreReductionFactor = 1 - rankDifference / maxRankDifference;
  return weight * scoreReductionFactor;
};

export const getFilteredUsers = async (currentUserId: string) => {
  try {
    // Fetch the current user to get preferences
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) throw new Error("Current user not found");

    // Prepare filter conditions
    const genderFilter = {
      gender: currentUser.interestedGender,
      interestedGender: currentUser.gender,
    };

    const ageFilter = currentUser.partnerAge
      ? {
          age: {
            $gte: currentUser.partnerAge.minValue,
            $lte: currentUser.partnerAge.maxValue,
          },
        }
      : {}; // No age filter if partnerAge is not defined

    const locationFilter =
      currentUser.currentLocation?.coordinates &&
      Array.isArray(currentUser.currentLocation.coordinates) &&
      currentUser.currentLocation.coordinates.length === 2
        ? {
            currentLocation: {
              $geoWithin: {
                $centerSphere: [
                  currentUser.currentLocation.coordinates, // [longitude, latitude]
                  100 / 6371, // 100 km radius converted to radians
                ],
              },
            },
          }
        : {};

    // Query to fetch filtered users excluding the current user and liked/disliked users
    const query = {
      _id: {
        $ne: currentUserId,
        $nin: [...currentUser.likedUsers, ...currentUser.dislikedUsers],
      },
      ...genderFilter,
      ...ageFilter,
      ...locationFilter,
      status: "ACTIVE",
    };

    // Aggregation pipeline to calculate matching scores
    const result = await User.aggregate([
      { $match: query }, // Step 1: Filter users based on gender, age, and location

      {
        $addFields: {
          // Step 2: Add a "score" field based on the comparison of various criteria
          score: {
            $add: [
              // Criterion 1: Country of Origin and Partner Preference
              {
                $cond: {
                  if: {
                    $eq: [
                      "$countryOfOrigin.name",
                      currentUser.countryOfOrigin.name,
                    ],
                  },
                  then: weights.partner_from_same_country,
                  else: calculateReducedScore(
                    partnerFromSameCountryRank[
                      currentUser.partnerFromSameCountry as keyof typeof partnerFromSameCountryRank // Type assertion
                    ],
                    partnerFromSameCountryRank[
                      "$partnerFromSameCountry" as keyof typeof partnerFromSameCountryRank // Type assertion
                    ],
                    weights.partner_from_same_country,
                    partnerFromSameCountryRank
                  ),
                },
              },

              // Criterion 2: Want Children
              {
                $cond: {
                  if: { $eq: ["$wantChildren", currentUser.wantChildren] },
                  then: weights.want_children,
                  else: calculateReducedScore(
                    wantChildrenRank[
                      currentUser.wantChildren as keyof typeof wantChildrenRank
                    ], // Type assertion
                    wantChildrenRank[
                      "$wantChildren" as keyof typeof wantChildrenRank
                    ], // Type assertion
                    weights.want_children,
                    wantChildrenRank
                  ),
                },
              },

              // Criterion 3: Want Marriage
              {
                $cond: {
                  if: { $eq: ["$wantMarriage", currentUser.wantMarriage] },
                  then: weights.want_marriage,
                  else: calculateReducedScore(
                    wantMarriageRank[
                      currentUser.wantMarriage as keyof typeof wantMarriageRank
                    ], // Type assertion
                    wantMarriageRank[
                      "$wantMarriage" as keyof typeof wantMarriageRank
                    ], // Type assertion
                    weights.want_marriage,
                    wantMarriageRank
                  ),
                },
              },

              // Criterion 4: Education Level
              {
                $cond: {
                  if: {
                    $gte: [
                      {
                        $indexOfArray: [
                          Object.keys(educationLevelRank),
                          "$educationLevel",
                        ],
                      },
                      {
                        $indexOfArray: [
                          Object.keys(educationLevelRank),
                          currentUser.educationLevel,
                        ],
                      },
                    ],
                  },
                  then: weights.education_level,
                  else: calculateReducedScore(
                    educationLevelRank[
                      currentUser.educationLevel as keyof typeof educationLevelRank
                    ], // Type assertion
                    educationLevelRank[
                      "$educationLevel" as keyof typeof educationLevelRank
                    ], // Type assertion
                    weights.education_level,
                    educationLevelRank
                  ),
                },
              },

              // Criterion 5: Height Preference
              {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$height", null] },
                      {
                        $gte: ["$height", currentUser.partnerHeight?.minValue],
                      },
                      {
                        $lte: ["$height", currentUser.partnerHeight?.maxValue],
                      },
                    ],
                  },
                  then: weights.height,
                  else: 0, // No reduced score for height, as it's a range check
                },
              },

              // Criterion 6: Return to Country
              {
                $cond: {
                  if: {
                    $eq: ["$returnToCountry", currentUser.returnToCountry],
                  },
                  then: weights.return_to_country,
                  else: calculateReducedScore(
                    returnToCountryRank[
                      currentUser.returnToCountry as keyof typeof returnToCountryRank
                    ], // Type assertion
                    returnToCountryRank[
                      "$returnToCountry" as keyof typeof returnToCountryRank
                    ], // Type assertion
                    weights.return_to_country,
                    returnToCountryRank
                  ),
                },
              },

              // Criterion 7: Smoking
              {
                $cond: {
                  if: { $eq: ["$smoking", currentUser.partnerSmoking] },
                  then: weights.smoking,
                  else: calculateReducedScore(
                    smokingRank[
                      currentUser.partnerSmoking as keyof typeof smokingRank
                    ], // Type assertion
                    smokingRank["$smoking" as keyof typeof smokingRank], // Type assertion
                    weights.smoking,
                    smokingRank
                  ),
                },
              },

              // Criterion 8: Physique
              {
                $cond: {
                  if: { $eq: ["$physique", currentUser.partnerPhysique] },
                  then: weights.physique,
                  else: calculateReducedScore(
                    physiqueRank[
                      currentUser.partnerPhysique as keyof typeof physiqueRank
                    ], // Type assertion
                    physiqueRank["$physique" as keyof typeof physiqueRank], // Type assertion
                    weights.physique,
                    physiqueRank
                  ),
                },
              },
            ],
          },
        },
      },

      // Step 3: Sort by score in descending order
      { $sort: { score: -1 } },
    ]);

    return result;
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    throw new Error("An error occurred while fetching and scoring users.");
  }
};
