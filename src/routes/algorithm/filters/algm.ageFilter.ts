import User from "../../user/user.model";

const filterUsersByAgeRange = async (users: any[], currentUserId: string) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser || !currentUser.partnerAge) {
    throw new Error("Current user or age range preferences not found");
  }

  const { partnerAge } = currentUser;

  // Use default values to ensure minValue and maxValue are numbers
  const minValue = partnerAge.minValue ?? 18; // Default to 18 if undefined
  const maxValue = partnerAge.maxValue ?? 99; // Default to 99 if undefined

  // Filter users based on age range
  return users.filter((user) => user.age >= minValue && user.age <= maxValue);
};

export { filterUsersByAgeRange };
