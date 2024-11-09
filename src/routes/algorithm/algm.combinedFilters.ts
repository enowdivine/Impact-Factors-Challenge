import { filterUsersByGender } from "./filters/algm.genderFilter";
import { filterUsersByAgeRange } from "./filters/algm.ageFilter";
import { filterUsersByLocation } from "./filters/algm.locationFilter";
import { calculateMatchingScoresForPool } from "./filters/algm.matchingFilter";

// Function to combine all filters: gender, age range, and location
const getFilteredUsers = async (currentUserId: string) => {
  try {
    // Step 1: Filter users by gender
    let response = await filterUsersByGender(currentUserId);

    // Step 2: Filter the already filtered users by age range
    let users = await filterUsersByAgeRange(response.users, currentUserId);

    // Step 3: Filter the already filtered users by location (100 km radius)
    users = await filterUsersByLocation(users, currentUserId);

    // Step 4: Filter the already filtered users in order of preference
    users = await calculateMatchingScoresForPool(response.currentUser, users);

    // Return the final filtered users
    return users;
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    throw error;
  }
};

export { getFilteredUsers };
