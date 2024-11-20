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

export const algorithmHandler = async (currentUserId: string) => {
  try {
    // Fetch the current user to get preferences
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) {
      return {
        success: false,
        users: [],
        message: "Current user not found",
      };
    }

    // Fetch the latest timestamp of when scores were last computed for this user
    const lastComputation = await UserMatch.findOne({ user1: currentUserId })
      .sort({ timestamp: -1 })
      .exec();
    const lastTimestamp = lastComputation
      ? lastComputation.timestamp
      : new Date(0);
    // **Filter for only new or updated users**
    const updatedAtFilter = { updatedAt: { $gt: lastTimestamp } };

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

    // Initialize variables for the search
    let radius = 100; // Starting radius in km
    const maxRadius = 700; // Maximum radius in km
    let result: any[] = [];

    const userCoordinates = currentUser.coordinates as {
      type: "Point";
      coordinates: [number, number];
    };

    // Loop to progressively expand the search radius
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

      // Query to fetch filtered users excluding the current user and liked/disliked users
      const query = {
        _id: {
          $ne: currentUserId,
          $nin: [...currentUser.likedUsers, ...currentUser.dislikedUsers],
        },
        ...genderFilter,
        ...ageFilter,
        ...locationFilter,
        ...updatedAtFilter,
        status: "ACTIVE",
      };

      // Aggregation pipeline to calculate matching scores
      try {
        result = await User.aggregate([
          { $match: query }, // Step 1: Filter users based on gender, age, and location

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
      } catch (error) {
        console.error("Error during aggregation:", error);
        throw new Error("Failed to execute aggregation query");
      }

      // If 70 or more users are found, break the loop
      if (result.length >= 70) {
        break;
      }

      // Increment the radius by 100 km
      radius += 100;
    }

    // Use bulkWrite to update scores in batches
    const bulkOperations = result
      .map((user) => {
        const user1Id = currentUserId;
        const user2Id = user._id;

        return [
          {
            updateOne: {
              filter: { user1: user1Id, user2: user2Id },
              update: { score: user.score, timestamp: new Date() },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: { user1: user2Id, user2: user1Id },
              update: { score: user.score, timestamp: new Date() },
              upsert: true,
            },
          },
        ];
      })
      .flat(); // Flatten the array of arrays

    // Perform all updates in a single bulkWrite operation
    try {
      if (bulkOperations.length > 0) {
        await UserMatch.bulkWrite(bulkOperations);
      }
    } catch (error) {
      console.error("Error during bulkWrite operation:", error);
      throw new Error("Failed to update user matches in bulk");
    }

    const matches = await UserMatch.find({ user1: currentUserId })
      .sort({ score: -1 })
      .populate("user2");

    // If no users are found after reaching a 700 km radius, suggest expanding the age range
    // if (radius > maxRadius && result.length === 0) {
    //   return {
    //     success: false,
    //     users: result,
    //     message:
    //       "There are no more users within your preferred age range. Increase the age range to see more users.",
    //   };
    // }

    return {
      success: true,
      users: matches.map((match) => ({
        user: match.user2,
        score: match.score,
      })),
      message: "Success",
    };
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    return {
      success: false,
      users: [],
      message: "An error occurred while fetching and scoring users.",
    };
  }
};
