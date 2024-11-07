import User from "../../user/user.model";

// Function to fetch users filtered by gender preferences
const filterUsersByGender = async (currentUserId: string) => {
  try {
    // Fetch the current user to get gender and interestedGender
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) throw new Error("Current user not found");

    const { gender, interestedGender } = currentUser;

    // Construct gender filter based on user's preferences
    let genderFilter = {};
    if (gender === "MAN" && interestedGender === "WOMAN") {
      // Heterosexual male interested in women
      genderFilter = { gender: "WOMAN", interestedGender: "MAN" };
    } else if (gender === "WOMAN" && interestedGender === "MAN") {
      // Heterosexual female interested in men
      genderFilter = { gender: "MAN", interestedGender: "WOMAN" };
    } else if (gender === "MAN" && interestedGender === "MAN") {
      // Gay male interested in other men
      genderFilter = { gender: "MAN", interestedGender: "MAN" };
    } else if (gender === "WOMAN" && interestedGender === "WOMAN") {
      // Lesbian female interested in other women
      genderFilter = { gender: "WOMAN", interestedGender: "WOMAN" };
    } else {
      // Handle other cases if necessary (e.g., non-binary, etc.)
      throw new Error("Unsupported gender preferences");
    }

    // Query to fetch users matching gender criteria, excluding the current user
    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      role: "USER",
      ...genderFilter,
    });

    return users;
  } catch (error) {
    console.error("Error filtering users by gender:", error);
    throw error;
  }
};

export { filterUsersByGender };
