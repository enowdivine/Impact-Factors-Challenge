import User from "./user.model";
import UserMatch from "../algorithm/algm.model";
import UserInteraction from "./user.interactionModel";
import UserDailyMatch from "./user.dailyMatchModel";
import crypto from "crypto";

export async function getTwoBestMatches(userId: string): Promise<any[]> {
  const currentDate = new Date().toISOString().split("T")[0];

  // Step 1: Fetch or initialize the daily match document for the user
  let dailyMatch = await UserDailyMatch.findOne({ user: userId });

  // Step 2: If today's matches already exist, filter out excluded users
  if (dailyMatch?.date === currentDate) {
    const excludedUserIds = await getExcludedUserIds(userId);

    // Filter matches to exclude already interacted users
    dailyMatch.matches = dailyMatch.matches.filter(
      (matchId) => !excludedUserIds.includes(matchId.toString())
    );

    await dailyMatch.save();

    if (dailyMatch.matches.length === 0) {
      return []; // No matches left
    }

    // Populate and return matches
    return await populateMatches(dailyMatch.matches);
  }

  // Step 3: Fetch new matches if no valid daily matches exist
  const excludedUserIds = await getExcludedUserIds(userId);

  const matches = await UserMatch.find({
    user1: userId,
    user2: { $nin: excludedUserIds },
  })
    .sort({ score: -1 })
    .limit(10)
    .populate("user2", "-password");

  if (!matches || matches.length === 0) {
    return []; // No matches available
  }

  // Step 4: Shuffle matches using seeded randomness
  const shuffledMatches = shuffleMatches(matches, currentDate);

  // Step 5: Select top 2 matches
  const selectedUsers = shuffledMatches.slice(0, 2);

  // Step 6: Update or create the daily match document
  const selectedUserIds = selectedUsers.map((user: any) => user._id);

  if (dailyMatch) {
    dailyMatch.date = currentDate;
    dailyMatch.matches = selectedUserIds;
  } else {
    dailyMatch = new UserDailyMatch({
      user: userId,
      date: currentDate,
      matches: selectedUserIds,
    });
  }

  await dailyMatch.save();

  return selectedUsers;
}

// Helper function to get excluded user IDs
async function getExcludedUserIds(userId: string): Promise<string[]> {
  const interactions = await UserInteraction.find({
    user: userId,
    type: { $in: ["LIKE", "DISLIKE", "BLOCK"] },
  }).select("targetUser");

  return interactions
    .filter((interaction) => interaction.targetUser) // Remove null/undefined values
    .map((interaction) => interaction.targetUser.toString());
}

// Helper function to populate user matches
async function populateMatches(matchIds: string[]): Promise<any[]> {
  return await User.find({ _id: { $in: matchIds } }).select("-password");
}

// Helper function for seeded randomness to shuffle matches
function shuffleMatches(matches: any[], currentDate: string): any[] {
  const seed = crypto.createHash("sha256").update(currentDate).digest("hex");
  const seedNumber = parseInt(seed.slice(0, 8), 16);

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  return matches
    .map((match) => ({
      user: match.user2,
      sort: seededRandom(seedNumber),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ user }) => user);
}
