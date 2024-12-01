import {
  weights,
  partnerFromSameCountryData,
  wantChildrenData,
  wantMarriageData,
  educationLevelData,
  heightPreferenceData,
  returnToCountryData,
  smokingData,
  physiqueData,
  //
  PartnerFromSameCountryKeys,
  WantChildrenKeys,
  WantMarriageKeys,
  EducationLevelKeys,
  ReturnToCountryKeys,
  SmokingKeys,
  PhysiqueKeys,
} from "./algm.data";
import User from "../user/user.model";
import UserMatch from "./algm.model";

export const computeMatchScores = async (currentUserId: string) => {
  try {
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // Get a list of already matched users
    let alreadyMatchedUserIds: string[] = [];
    const userMatches = await UserMatch.find({ user1: currentUserId })
      .distinct("user2")
      .exec();

    if (userMatches.length > 0) {
      alreadyMatchedUserIds = userMatches; // Use matched user IDs if available
    } else {
      alreadyMatchedUserIds = []; // Fallback to an empty array
    }

    // Prepare filters
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
      : {};

    const userCoordinates = currentUser.coordinates as {
      type: "Point";
      coordinates: [number, number];
    };

    let radius = 100; // Start radius
    const maxRadius = 700; // Max radius
    let result: any[] = [];

    while (radius <= maxRadius) {
      const locationFilter =
        currentUser.coordinates && currentUser.coordinates.type === "Point"
          ? {
              coordinates: {
                $geoWithin: {
                  $centerSphere: [userCoordinates.coordinates, radius / 6371],
                },
              },
            }
          : {};

      const query = {
        _id: {
          $ne: currentUserId,
          $nin: [
            ...currentUser.likedUsers,
            ...currentUser.dislikedUsers,
            ...alreadyMatchedUserIds, // Exclude already matched users
          ],
        },
        ...genderFilter,
        ...ageFilter,
        ...locationFilter,
        status: "ACTIVE",
      };

      // Perform aggregation
      result = await User.aggregate([
        { $match: query },
        {
          $addFields: {
            score: {
              $add: [
                // Priority 1: Country of Origin Preference
                {
                  $multiply: [
                    {
                      $cond: [
                        {
                          $eq: [
                            "$countryOfOrigin",
                            currentUser.countryOfOrigin,
                          ],
                        },
                        partnerFromSameCountryData[
                          currentUser.partnerFromSameCountry as PartnerFromSameCountryKeys
                        ]?.scoreIfMatch || 1,
                        partnerFromSameCountryData[
                          currentUser.partnerFromSameCountry as PartnerFromSameCountryKeys
                        ]?.scoreIfDifferent || 1,
                      ],
                    },
                    weights.partnerFromSameCountry,
                  ],
                },
                // Priority 2: Want Children
                {
                  $multiply: [
                    wantChildrenData[
                      currentUser.wantChildren as WantChildrenKeys
                    ]?.[
                      "$wantChildren" as WantChildrenKeys // Access the potential match's attribute
                    ] || 1,
                    weights.wantChildren,
                  ],
                },
                // Priority 3: Want Marriage
                {
                  $multiply: [
                    wantMarriageData[
                      currentUser.wantMarriage as WantMarriageKeys
                    ]?.[
                      "$wantMarriage" as WantMarriageKeys // Access the potential match's attribute
                    ] || 1,
                    weights.wantMarriage,
                  ],
                },
                // Priority 4: Education Level
                {
                  $multiply: [
                    educationLevelData[
                      currentUser.educationLevel as EducationLevelKeys
                    ]?.["$educationLevel" as EducationLevelKeys] || 1, // Access the potential match's attribute
                    weights.educationLevel,
                  ],
                },
                // Priority 5: Height Preference
                {
                  $multiply: [
                    {
                      $cond: [
                        {
                          $and: [
                            {
                              $gte: [
                                "$height.minValue",
                                currentUser.partnerHeight?.minValue,
                              ],
                            },
                            {
                              $lte: [
                                "$height.maxValue",
                                currentUser.partnerHeight?.maxValue,
                              ],
                            },
                          ],
                        },
                        heightPreferenceData.withinRange,
                        heightPreferenceData.outsideRange,
                      ],
                    },
                    weights.heightPreference,
                  ],
                },
                // Priority 6: Return to Country
                {
                  $multiply: [
                    returnToCountryData[
                      currentUser.returnToCountry as ReturnToCountryKeys
                    ]?.["$returnToCountry" as ReturnToCountryKeys] || 1, // Access the potential match's attribute
                    weights.returnToCountry,
                  ],
                },
                // Priority 7: Smoking Compatibility
                {
                  $multiply: [
                    smokingData[currentUser.partnerSmoking as SmokingKeys]?.[
                      "$smoking" as SmokingKeys // Access the potential match's attribute
                    ] || 1,
                    weights.smokingPreference,
                  ],
                },
                // Priority 8: Physique Preference
                {
                  $multiply: [
                    physiqueData[currentUser.physique as PhysiqueKeys]?.[
                      "$physique" as PhysiqueKeys // Access the potential match's attribute
                    ] || 1,
                    weights.physiquePreference,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { score: -1 } },
      ]);

      if (result.length > 0) break; // Break if users are found
      radius += 100; // Increment radius
    }

    if (result.length === 0) {
      console.log("No matches found");
      return;
    }

    // Save the scores to UserMatch collection
    const bulkOperations = result.map((user) => {
      const user1Id = currentUserId;
      const user2Id = user._id;

      return {
        updateOne: {
          filter: { user1: user1Id, user2: user2Id },
          update: {
            user1: user1Id,
            user2: user2Id,
            score: user.score,
            user1Liked: false,
            user2Liked: false,
            isMutual: false,
            timestamp: new Date(),
          },
          upsert: true,
        },
      };
    });

    if (bulkOperations.length > 0) {
      await UserMatch.bulkWrite(bulkOperations);
    }

    console.log("Scores computed and saved successfully");

    return result; // Return computed scores
  } catch (error) {
    console.error("Error computing scores:", error);
    throw error;
  }
};

export const updateMatchScores = async (currentUserId: string) => {
  try {
    // 1. Compute scores for the current user relative to others
    await computeMatchScores(currentUserId);

    // 2. Find all users for whom this user is in range
    const affectedUsers = await fetchUsersForRecalculation(currentUserId);

    // 3. Recompute scores for affected users relative to the current user
    await Promise.all(
      affectedUsers.map(async (userId) => {
        await computeMatchScores(userId.toString());
      })
    );

    return { success: true, message: "Scores updated successfully" };
  } catch (error: any) {
    console.error("Error in algorithmHandler:", error);
    return { success: false, message: error.message };
  }
};

const fetchUsersForRecalculation = async (currentUserId: string) => {
  // Find all users who have the current user in their range
  return await UserMatch.find({ user2: currentUserId })
    .distinct("user1")
    .exec();
};
