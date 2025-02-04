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
import ScoredUsers from "./algm.model";
import UserInteraction from "../user/user.interactionModel";

export const computeMatchScores = async (currentUserId: string) => {
  try {
    const currentUser = await User.findById(currentUserId).exec();
    if (!currentUser) throw new Error("Current user not found");

    // Fetch liked, disliked, blocked users, already matched users, and users who blocked the current user
    const [
      likedDislikedBlockedUserIds,
      alreadyMatchedUserIds,
      blockedByUserIds,
    ] = await Promise.all([
      UserInteraction.find({
        user: currentUserId,
        type: { $in: ["LIKE", "DISLIKE", "BLOCK"] },
      }).distinct("targetUser"),
      ScoredUsers.find({ user1: currentUserId }).distinct("user2"),
      UserInteraction.find({
        targetUser: currentUserId,
        type: "BLOCK",
      }).distinct("user"),
    ]);

    // Combine all excluded user IDs
    const excludedUserIds = new Set([
      ...likedDislikedBlockedUserIds,
      ...alreadyMatchedUserIds,
      ...blockedByUserIds,
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

    console.log(userCoordinates.coordinates);

    let radius = 100; // Start radius
    const maxRadius = 700; // Max radius
    let totalScoredUsers = 0; // Track the total number of users scored

    // Step 1: Dynamically expand search radius until users are found or max radius is reached
    while (radius <= maxRadius) {
      const query = {
        _id: {
          $ne: currentUserId,
          $nin: Array.from(excludedUserIds), // Exclude blocked users and those who block the current user
        },
        ...genderFilter,
        ...ageFilter,
        coordinates: {
          $geoWithin: {
            $centerSphere: [userCoordinates.coordinates, radius / 6371], // [longitude, latitude], radius in radians
          },
        },
        status: "ACTIVE",
      };

      let offset = 0;
      const batchSize = 500;

      while (true) {
        // Fetch potential users for this radius
        const potentialUsers = await User.find(query)
          .skip(offset)
          .limit(batchSize)
          .lean();
        if (!potentialUsers.length) break;

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

        // Update total scored users
        totalScoredUsers += scoredUsers.length;

        // Save scores to the database in chunks
        const chunk: any[] = scoredUsers.map((user) => ({
          updateOne: {
            filter: { user1: currentUserId, user2: user._id },
            update: {
              user1: currentUserId,
              user2: user._id,
              score: user.score,
            },
            upsert: true,
          },
        }));

        // Execute bulkWrite for the current chunk
        try {
          await ScoredUsers.bulkWrite(chunk);
          console.log(`Processed chunk ${batchSize}`);
        } catch (error) {
          console.error(`Error processing chunk ${batchSize}:`, error);
        }

        offset += batchSize;
      }

      if (totalScoredUsers > 0) break; // Stop if matches are found
      radius += 100; // Increase radius and retry
    }

    if (totalScoredUsers === 0) {
      console.log("No matches found");
      return { success: false, message: "No matches found", matches: [] };
    }

    console.log("Scores computed and saved successfully");

    return; // Return computed scores
  } catch (error) {
    console.error("Error computing scores:", error);
    throw error;
  }
};

const computeIndividualScore = (user1: any, user2: any) => {
  let score = 0;

  // Calculate scores for each criterion
  // Priority 1: Country of Origin Preference
  const countryScore =
    user2.countryOfOrigin?.cca2 === user1.countryOfOrigin?.cca2
      ? partnerFromSameCountryData[
          user1.partnerFromSameCountry as PartnerFromSameCountryKeys
        ]?.scoreIfMatch || 1
      : partnerFromSameCountryData[
          user1.partnerFromSameCountry as PartnerFromSameCountryKeys
        ]?.scoreIfDifferent || 1;

  score += countryScore * weights.partnerFromSameCountry;

  // Priority 2: Want Children
  const wantChildrenScore =
    wantChildrenData[user1.wantChildren as WantChildrenKeys]?.[
      user2.wantChildren as WantChildrenKeys
    ] || 1;
  score += wantChildrenScore * weights.wantChildren;

  // Priority 3: Want Marriage
  const wantMarriageScore =
    wantMarriageData[user1.wantMarriage as WantMarriageKeys]?.[
      user2.wantMarriage as WantMarriageKeys
    ] || 1;
  score += wantMarriageScore * weights.wantMarriage;

  // Priority 4: Education Level
  const educationScore =
    educationLevelData[user1.educationLevel as EducationLevelKeys]?.[
      user2.educationLevel as EducationLevelKeys
    ] || 1;
  score += educationScore * weights.educationLevel;

  // Priority 5: Height Preference
  const heightScore =
    (user2.height as number) >= (user1.partnerHeight?.minValue as number) &&
    (user2.height as number) <= (user1.partnerHeight?.maxValue as number)
      ? heightPreferenceData.withinRange // Within the preferred range
      : heightPreferenceData.outsideRange; // Outside the preferred range

  score += heightScore * weights.heightPreference;

  // Priority 6: Return to Country
  const returnToCountryScore =
    returnToCountryData[user1.returnToCountry as ReturnToCountryKeys]?.[
      user2.returnToCountry as ReturnToCountryKeys
    ] || 1;
  score += returnToCountryScore * weights.returnToCountry;

  // Priority 7: Smoking Compatibility
  const smokingScore =
    smokingData[user1.partnerSmoking as SmokingKeys]?.[
      user2.smoking as SmokingKeys
    ] || 1;
  score += smokingScore * weights.smokingPreference;

  // Priority 8: Physique Preference
  const physiqueScore =
    physiqueData[user1.physique as PhysiqueKeys]?.[
      user2.physique as PhysiqueKeys
    ] || 1;
  score += physiqueScore * weights.physiquePreference;

  return score;
};

const fetchUsersForRecalculation = async (currentUserId: string) => {
  // Find all users who have the current user in their range
  return await ScoredUsers.find({ user2: currentUserId })
    .distinct("user1")
    .exec();
};

// Helper function to process a batch
const processBatch = async (
  batch: any[],
  updatedUser: any,
  currentUserId: string
) => {
  const updates = [];

  for (const affectedUser of batch) {
    if (!affectedUser) continue; // Ensure the user object is valid

    // Compute the score between the updated user and the affected user
    const score = computeIndividualScore(updatedUser, affectedUser);

    // Prepare the update operation
    updates.push({
      updateOne: {
        filter: { user1: currentUserId, user2: affectedUser._id },
        update: { score: score },
        upsert: true,
      },
    });
  }

  // Execute the batch updates in bulk
  if (updates.length > 0) {
    await ScoredUsers.bulkWrite(updates);
  }
};

export const updateMatchScores = async (currentUserId: string) => {
  try {
    const updatedUser = await User.findById(currentUserId).exec();
    if (!updatedUser) throw new Error("Current user not found");

    // 1. Compute scores for the current user relative to others
    await computeMatchScores(currentUserId);

    // 2. Find all users for whom this user is in range
    const affectedUsers = await fetchUsersForRecalculation(currentUserId);

    // 3. Define batch size and process in parallel
    const batchSize = 500;

    // Create batch promises
    const batchPromises = [];
    for (let i = 0; i < affectedUsers.length; i += batchSize) {
      const batch = affectedUsers.slice(i, i + batchSize);

      // Add a batch processing promise
      batchPromises.push(processBatch(batch, updatedUser, currentUserId));
    }

    // Execute all batch promises in parallel
    await Promise.all(batchPromises);

    return { success: true, message: "Scores updated successfully" };
  } catch (error) {
    console.error("Error in updateMatchScores:", error);
    return { success: false, message: error };
  }
};
