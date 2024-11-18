import User from "../user/user.model";
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

    // Initialize variables for the search
    let radius = 100; // Starting radius in km
    const maxRadius = 700; // Maximum radius in km
    let result: any[] = [];

    // Loop to progressively expand the search radius
    while (radius <= maxRadius) {
      const locationFilter =
        currentUser.currentLocation?.coordinates &&
        Array.isArray(currentUser.currentLocation.coordinates) &&
        currentUser.currentLocation.coordinates.length === 2
          ? {
              currentLocation: {
                $geoWithin: {
                  $centerSphere: [
                    currentUser.currentLocation.coordinates, // [longitude, latitude]
                    radius / 6371, // Radius in radians
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
        // ...locationFilter,
        status: "ACTIVE",
      };

      // Aggregation pipeline to calculate matching scores
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

      // If 70 or more users are found, break the loop
      if (result.length >= 70) {
        break;
      }

      // Increment the radius by 100 km
      radius += 100;
    }

    // If no users are found after reaching a 700 km radius, suggest expanding the age range
    if (radius > maxRadius && result.length === 0) {
      return {
        success: false,
        users: result,
        message:
          "There are no more users within your preferred age range. Increase the age range to see more users.",
      };
    }

    return {
      success: true,
      users: result,
      message: "Success",
    };
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    // throw new Error("");
    return {
      success: false,
      users: [],
      message: "An error occurred while fetching and scoring users.",
    };
  }
};
