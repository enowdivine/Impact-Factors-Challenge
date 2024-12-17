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
import UserInteraction from "../user/user.interactionModel";

export const computeMatchScores = async (currentUserId: string) => {
  try {
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) throw new Error("Current user not found");

    // Fetch liked/disliked users and already matched users
    const [likedAndDislikedUserIds, alreadyMatchedUserIds] = await Promise.all([
      UserInteraction.find({
        user: currentUserId,
        type: { $in: ["LIKE", "DISLIKE"] },
      }).distinct("targetUser"),
      UserMatch.find({ user1: currentUserId }).distinct("user2"),
    ]);

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

    // Step 1: Dynamically expand search radius until users are found or max radius is reached
    while (radius <= maxRadius) {
      const locationFilter = userCoordinates
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
          $nin: [...likedAndDislikedUserIds, ...alreadyMatchedUserIds],
        },
        ...genderFilter,
        ...ageFilter,
        ...locationFilter,
        status: "ACTIVE",
      };

      // Fetch potential users for this radius
      const potentialUsers = await User.find(query).lean();

      // Step 2: Compute scores for each user manually
      const scoredUsers = potentialUsers.map((potentialUser) => {
        let score = 0;

        // Priority 1: Country of Origin Preference
        const countryScore =
          potentialUser.countryOfOrigin?.cca2 ===
          currentUser.countryOfOrigin?.cca2
            ? partnerFromSameCountryData[
                currentUser.partnerFromSameCountry as PartnerFromSameCountryKeys
              ]?.scoreIfMatch || 1
            : partnerFromSameCountryData[
                currentUser.partnerFromSameCountry as PartnerFromSameCountryKeys
              ]?.scoreIfDifferent || 1;

        score += countryScore * weights.partnerFromSameCountry;

        // Priority 2: Want Children
        const wantChildrenScore =
          wantChildrenData[currentUser.wantChildren as WantChildrenKeys]?.[
            potentialUser.wantChildren as WantChildrenKeys
          ] || 1;
        score += wantChildrenScore * weights.wantChildren;

        // Priority 3: Want Marriage
        const wantMarriageScore =
          wantMarriageData[currentUser.wantMarriage as WantMarriageKeys]?.[
            potentialUser.wantMarriage as WantMarriageKeys
          ] || 1;
        score += wantMarriageScore * weights.wantMarriage;

        // Priority 4: Education Level
        const educationScore =
          educationLevelData[
            currentUser.educationLevel as EducationLevelKeys
          ]?.[potentialUser.educationLevel as EducationLevelKeys] || 1;
        score += educationScore * weights.educationLevel;

        // Priority 5: Height Preference
        const heightScore =
          (potentialUser.height as number) >=
            (currentUser.partnerHeight?.minValue as number) &&
          (potentialUser.height as number) <=
            (currentUser.partnerHeight?.maxValue as number)
            ? heightPreferenceData.withinRange // Within the preferred range
            : heightPreferenceData.outsideRange; // Outside the preferred range

        score += heightScore * weights.heightPreference;

        // Priority 6: Return to Country
        const returnToCountryScore =
          returnToCountryData[
            currentUser.returnToCountry as ReturnToCountryKeys
          ]?.[potentialUser.returnToCountry as ReturnToCountryKeys] || 1;
        score += returnToCountryScore * weights.returnToCountry;

        // Priority 7: Smoking Compatibility
        const smokingScore =
          smokingData[currentUser.partnerSmoking as SmokingKeys]?.[
            potentialUser.smoking as SmokingKeys
          ] || 1;
        score += smokingScore * weights.smokingPreference;

        // Priority 8: Physique Preference
        const physiqueScore =
          physiqueData[currentUser.physique as PhysiqueKeys]?.[
            potentialUser.physique as PhysiqueKeys
          ] || 1;
        score += physiqueScore * weights.physiquePreference;

        return { ...potentialUser, score }; // Return user data with computed score
      });

      // Add users with scores to the result array
      result = scoredUsers.sort((a, b) => b.score - a.score);
      if (result.length > 0) break; // Stop if matches are found

      radius += 100; // Increase radius and retry
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
