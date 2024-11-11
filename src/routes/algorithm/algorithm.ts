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

// Aggregation pipeline to calculate matching scores
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
      currentUser.currentLocation?.latitude &&
      currentUser.currentLocation?.longitude
        ? {
            currentLocation: {
              $geoWithin: {
                $centerSphere: [
                  [
                    currentUser.currentLocation.longitude,
                    currentUser.currentLocation.latitude,
                  ],
                  100 / 6371, // 100 km radius (in radians)
                ],
              },
            },
          }
        : {}; // No location filter if currentLocation is not provided

    // Query to fetch filtered users excluding the current user and liked/disliked users
    const query = {
      _id: {
        $ne: currentUserId,
        $nin: [...currentUser.likedUsers, ...currentUser.dislikedUsers],
      },
      ...genderFilter,
      ...ageFilter,
      ...locationFilter,
      status: "ACTIVE", // Ensure we only get active users
    };

    // Aggregation pipeline to calculate matching scores
    const result = await User.aggregate([
      { $match: query }, // Step 1: Filter users based on gender, age, and location

      {
        $addFields: {
          // Step 2: Add a "score" field based on the comparison of various criteria

          score: {
            $add: [
              // Criterion 1: Country of Origin
              {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          "$countryOfOrigin.name",
                          currentUser.countryOfOrigin.name,
                        ],
                      },
                      { $ne: ["$partnerFromSameCountry", null] },
                    ],
                  },
                  then: weights.country_of_origin,
                  else: 0,
                },
              },

              // Criterion 2: Want Children
              {
                $cond: {
                  if: { $eq: ["$wantChildren", currentUser.wantChildren] },
                  then: {
                    $multiply: [
                      weights.want_children,
                      {
                        $arrayElemAt: [
                          Object.values(wantChildrenRank),
                          {
                            $indexOfArray: [
                              Object.keys(wantChildrenRank),
                              "$wantChildren",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
                },
              },

              // Criterion 3: Want Marriage
              {
                $cond: {
                  if: { $eq: ["$wantMarriage", currentUser.wantMarriage] },
                  then: {
                    $multiply: [
                      weights.want_marriage,
                      {
                        $arrayElemAt: [
                          Object.values(wantMarriageRank),
                          {
                            $indexOfArray: [
                              Object.keys(wantMarriageRank),
                              "$wantMarriage",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
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
                  else: 0,
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
                      }, // Safely check if partnerHeight exists
                      {
                        $lte: ["$height", currentUser.partnerHeight?.maxValue],
                      }, // Safely check if partnerHeight exists
                    ],
                  },
                  then: weights.height,
                  else: 0,
                },
              },

              // Criterion 6: Return to Country
              {
                $cond: {
                  if: {
                    $eq: ["$returnToCountry", currentUser.returnToCountry],
                  },
                  then: {
                    $multiply: [
                      weights.return_to_country,
                      {
                        $arrayElemAt: [
                          Object.values(returnToCountryRank),
                          {
                            $indexOfArray: [
                              Object.keys(returnToCountryRank),
                              "$returnToCountry",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
                },
              },

              // Criterion 7: Smoking
              {
                $cond: {
                  if: { $eq: ["$smoking", currentUser.partnerSmoking] },
                  then: {
                    $multiply: [
                      weights.smoking,
                      {
                        $arrayElemAt: [
                          Object.values(smokingRank),
                          {
                            $indexOfArray: [
                              Object.keys(smokingRank),
                              "$smoking",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
                },
              },

              // Criterion 8: Physique
              {
                $cond: {
                  if: { $eq: ["$physique", currentUser.partnerPhysique] },
                  then: {
                    $multiply: [
                      weights.physique,
                      {
                        $arrayElemAt: [
                          Object.values(physiqueRank),
                          {
                            $indexOfArray: [
                              Object.keys(physiqueRank),
                              "$physique",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
                },
              },

              // Criterion 9: Partner Age
              {
                $cond: {
                  if: {
                    $and: [
                      { $ne: [currentUser.partnerAge, null] },
                      { $ne: [currentUser.partnerAge?.minValue, undefined] },
                      { $ne: [currentUser.partnerAge?.maxValue, undefined] },
                      { $gte: ["$age", currentUser.partnerAge?.minValue] },
                      { $lte: ["$age", currentUser.partnerAge?.maxValue] },
                    ],
                  },
                  then: weights.partner_age,
                  else: 0,
                },
              },

              // Criterion 10: Partner from Same Country
              {
                $cond: {
                  if: {
                    $eq: [
                      "$partnerFromSameCountry",
                      currentUser.partnerFromSameCountry,
                    ],
                  },
                  then: {
                    $multiply: [
                      weights.partner_from_same_country,
                      {
                        $arrayElemAt: [
                          Object.values(partnerFromSameCountryRank),
                          {
                            $indexOfArray: [
                              Object.keys(partnerFromSameCountryRank),
                              "$partnerFromSameCountry",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  else: 0,
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
